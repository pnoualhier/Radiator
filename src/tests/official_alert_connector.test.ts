import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { OfficialAlertConnector, type OfficialAlertRawPayload } from '../connectors/OfficialAlertConnector';

describe('OfficialAlertConnector Specification & Lifecycle (P1)', () => {
  beforeEach(() => {
    OfficialAlertConnector.resetForTesting(false);
  });

  test('Official sources contain verifiable institutional URLs', () => {
    const sources = OfficialAlertConnector.OFFICIAL_SOURCES;
    assert.ok(sources.length >= 3, 'Should have at least 3 institutional sources');

    const asnr = sources.find(s => s.code === 'ASNR');
    assert.ok(asnr, 'ASNR source must be defined');
    assert.ok(asnr.feed_url.includes('asnr.fr'), 'ASNR feed URL must be on asnr.fr');

    const teleray = sources.find(s => s.code === 'IRSN_TELERAY');
    assert.ok(teleray, 'TELERAY source must be defined');
    assert.equal(teleray.feed_url, 'https://teleray.asnr.fr');
  });

  test('Correctly imports official notices with original URL and date', () => {
    const alerts = OfficialAlertConnector.getAlerts();
    assert.ok(alerts.length > 0, 'Should have seeded official alerts');

    for (const a of alerts) {
      assert.ok(a.official_url && a.official_url.startsWith('https://'), 'Must have official HTTPS URL');
      assert.ok(a.published_at, 'Must have published date');
      assert.ok(a.source_authority, 'Must specify official authority');
      assert.equal(a.is_algorithmically_generated, false, 'Must NEVER be algorithmically generated');
      assert.ok(a.verification_seal?.startsWith('SEAL-ASNR-'), 'Must have SHA-256 integrity seal');
    }
  });

  test('Deduplicates alerts when the same external_id is upserted', () => {
    const initialCount = OfficialAlertConnector.getAlerts().length;

    const payload: OfficialAlertRawPayload = {
      external_id: 'ASNR-TELERAY-BULL-2026-W40', // Existing ID
      source_authority: 'Autorité de Sûreté Nucléaire et Radioprotection (ASNR)',
      source_code: 'ASNR',
      title: 'Bulletin de surveillance radiologique nationale Téléray & OPERA-Air (Mise à jour)',
      raw_content: 'Mise à jour confirmée du bulletin hebdomadaire.',
      ines_rating: 0,
      severity_level: 'INFO',
      status: 'ACTIVE',
      geographic_scope: 'Territoire national',
      source_document_url: 'https://reglementation-controle.asnr.fr/controle/actualites-du-controle',
      published_timestamp: new Date().toISOString(),
    };

    const res = OfficialAlertConnector.upsertAlert(payload);
    assert.equal(res.action, 'UPDATED', 'Should update existing alert rather than duplicate');

    const finalCount = OfficialAlertConnector.getAlerts().length;
    assert.equal(finalCount, initialCount, 'Alert count must remain identical after deduplication');

    const updated = OfficialAlertConnector.getAlertByExternalId('ASNR-TELERAY-BULL-2026-W40');
    assert.equal(updated?.title, payload.title);
  });

  test('Manages alert closure (resolution) with timestamp and seal update', () => {
    const alertId = 'ASNR-TELERAY-BULL-2026-W40';
    const resolved = OfficialAlertConnector.resolveAlert(alertId, 'Événement clôturé formellement.');
    assert.ok(resolved);
    assert.equal(resolved.status, 'RESOLVED');
    assert.ok(resolved.ends_at);
    assert.ok(resolved.description.includes('clôture'));
  });

  test('Handles empty state with clear contract', () => {
    OfficialAlertConnector.resetForTesting(true); // Empty ledger
    const alerts = OfficialAlertConnector.getAlerts();
    assert.equal(alerts.length, 0);

    const status = OfficialAlertConnector.getConnectorStatus();
    assert.equal(status.active_alerts_count, 0);
    assert.equal(status.total_official_bulletins, 0);
  });

  test('Rejects synthetic or algorithmically generated alerts', () => {
    const raw = {
      external_id: 'SYNTH-123',
      source_authority: 'AI Generator',
      source_code: 'AI',
      title: 'Alerte générée par algorithme',
      raw_content: 'Contenu synthétique',
      severity_level: 'WARNING' as const,
      status: 'ACTIVE' as const,
      geographic_scope: 'France',
      source_document_url: 'https://fake.local',
      published_timestamp: new Date().toISOString(),
      is_algorithmically_generated: true,
    };

    const res = OfficialAlertConnector.upsertAlert(raw as any);
    assert.equal(res.action, 'REJECTED');
    assert.ok(res.error?.includes('Rejet éthique'));
  });
});
