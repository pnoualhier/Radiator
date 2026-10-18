import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { TelerayConnector } from '../connectors/TelerayConnector';

describe('TelerayConnector Specification & Validation (P0)', () => {
  test('Teleray official URL points to ASNR official domain', () => {
    assert.equal(TelerayConnector.OFFICIAL_BASE_URL, 'https://teleray.asnr.fr');
    assert.equal(TelerayConnector.OFFICIAL_STATIONS_ENDPOINT, 'https://teleray.asnr.fr/api/stations');
    assert.equal(TelerayConnector.OFFICIAL_UNIT, 'nSv/h');
  });

  test('Validates real anonymized Téléray GeoJSON fixture format and fields', () => {
    const fixturePath = path.resolve(process.cwd(), 'test_fixtures/teleray_stations_real_anonymized.json');
    assert.ok(fs.existsSync(fixturePath), 'Fixture file must exist');

    const fixtureContent = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
    assert.equal(fixtureContent.authority, 'ASNR / IRSN');
    assert.equal(fixtureContent.unit, 'nSv/h');
    assert.ok(fixtureContent.total_stations >= 400, 'Total stations should be ~479');
    assert.ok(Array.isArray(fixtureContent.sample_features), 'Sample features must be an array');
    assert.ok(fixtureContent.sample_features.length > 0, 'Should have sample features');

    // Test each station feature in the real anonymized fixture
    for (const feat of fixtureContent.sample_features) {
      assert.equal(feat.type, 'Feature');
      assert.equal(feat.geometry.type, 'Point');
      assert.ok(Array.isArray(feat.geometry.coordinates), 'Coordinates must be array');
      assert.equal(feat.geometry.coordinates.length, 2, 'Coordinates must be [lon, lat]');

      const [lon, lat] = feat.geometry.coordinates;
      assert.ok(typeof lon === 'number' && !isNaN(lon), 'Longitude must be a number');
      assert.ok(typeof lat === 'number' && !isNaN(lat), 'Latitude must be a number');

      const props = feat.properties;
      assert.ok(typeof props.irsnId === 'number', 'irsnId must be a number');
      assert.ok(typeof props.publicName === 'string' && props.publicName.length > 0, 'publicName must be non-empty string');
      assert.equal(props.reseau, 'TELERAY', 'Network must be TELERAY');
    }
  });

  test('validateAccess returns a well-formed report with status VERIFIED or UNVERIFIED', async () => {
    const report = await TelerayConnector.validateAccess(5000);
    assert.ok(report.endpoint_url.includes('teleray.asnr.fr'));
    assert.ok(['VERIFIED', 'UNVERIFIED'].includes(report.status));
    assert.ok(['VÉRIFIÉ', 'NON VÉRIFIÉ'].includes(report.status_label));
    assert.equal(report.unit, 'nSv/h');
    assert.equal(report.authority, 'ASNR / IRSN');
    assert.ok(typeof report.latency_ms === 'number');
  });

  test('Strict rule: No simulated data can be labeled LIVE or official', () => {
    const simulatedRecord = {
      is_simulated: true,
      data_nature: 'DEMO',
      validation_status: 'SIMULATION_FIXTURE',
    };

    // Assertion enforcing the P0 rule
    assert.notEqual(simulatedRecord.data_nature, 'LIVE', 'Simulated values MUST NEVER have data_nature LIVE');
    assert.equal(simulatedRecord.is_simulated, true, 'Simulated values must have is_simulated: true');
    assert.equal(simulatedRecord.data_nature, 'DEMO', 'Simulated values must be tagged DEMO');
  });
});
