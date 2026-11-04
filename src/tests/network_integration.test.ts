import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { NetworkIntegritySupervisor } from '../connectors/NetworkIntegritySupervisor';

describe('Network Integrity & 6 Announced Networks Proof (P0)', () => {
  test('Supervises all 6 networks announced in README', async () => {
    const reports = await NetworkIntegritySupervisor.runAllIntegrationTests();
    assert.equal(reports.length, 6, 'Must evaluate exactly 6 networks');

    const codes = reports.map(r => r.code);
    assert.ok(codes.includes('TELERAY'), 'Téléray must be evaluated');
    assert.ok(codes.includes('HYDROTELERAY'), 'HydroTéléray must be evaluated');
    assert.ok(codes.includes('OPERA_AIR'), 'OPERA-Air must be evaluated');
    assert.ok(codes.includes('EURDEP'), 'EURDEP must be evaluated');
    assert.ok(codes.includes('OPENRADIATION'), 'OpenRadiation must be evaluated');
    assert.ok(codes.includes('SAFECAST'), 'Safecast must be evaluated');
  });

  test('Strict Rule: A network with 0 imported measurements MUST NOT be labeled is_connected: true', async () => {
    const reports = await NetworkIntegritySupervisor.runAllIntegrationTests({
      telerayStationsCount: 479,
      openRadiationData: { stationsCount: 50, measurementsCount: 50 },
      safecastData: { stationsCount: 25, measurementsCount: 25 },
    });

    for (const r of reports) {
      if (r.imported_measurements_count === 0) {
        assert.equal(
          r.is_connected,
          false,
          `Network ${r.code} has 0 measurements imported; it CANNOT be marked as is_connected: true`
        );
        assert.notEqual(
          r.connection_state,
          'CONNECTED',
          `Network ${r.code} connection_state cannot be CONNECTED when 0 measurements are imported`
        );
      }
    }
  });

  test('Téléray is certified as CATALOG_ONLY (0 direct measurements), NOT falsely CONNECTED', async () => {
    const reports = await NetworkIntegritySupervisor.runAllIntegrationTests({
      telerayStationsCount: 479,
    });
    const teleray = reports.find(r => r.code === 'TELERAY');
    assert.ok(teleray, 'Téléray report must exist');
    assert.equal(teleray.is_connected, false);
    assert.equal(teleray.connection_state, 'CATALOG_ONLY');
    assert.equal(teleray.imported_stations_count, 479);
    assert.equal(teleray.imported_measurements_count, 0);
    assert.ok(teleray.status_label.includes('Répertoire seul'));
  });

  test('OpenRadiation with real live stream is certified as CONNECTED', async () => {
    const reports = await NetworkIntegritySupervisor.runAllIntegrationTests({
      openRadiationData: { stationsCount: 50, measurementsCount: 50 },
    });
    const orad = reports.find(r => r.code === 'OPENRADIATION');
    assert.ok(orad, 'OpenRadiation report must exist');
    assert.equal(orad.is_connected, true);
    assert.equal(orad.connection_state, 'CONNECTED');
    assert.ok(orad.imported_measurements_count > 0);
  });

  test('EURDEP with restricted access is labeled RESTRICTED_ACCESS and is_connected: false', async () => {
    const reports = await NetworkIntegritySupervisor.runAllIntegrationTests();
    const eurdep = reports.find(r => r.code === 'EURDEP');
    assert.ok(eurdep, 'EURDEP report must exist');
    assert.equal(eurdep.is_connected, false);
    assert.equal(eurdep.connection_state, 'RESTRICTED_ACCESS');
    assert.equal(eurdep.imported_measurements_count, 0);
  });

  test('Each network report contains a real integration test result with URL, latency and verdict', async () => {
    const reports = await NetworkIntegritySupervisor.runAllIntegrationTests();
    for (const r of reports) {
      assert.ok(r.integration_test, `Network ${r.code} must have integration_test`);
      assert.ok(r.integration_test.endpoint_url.startsWith('https://'));
      assert.ok(typeof r.integration_test.latency_ms === 'number');
      assert.ok(typeof r.integration_test.verdict === 'string' && r.integration_test.verdict.length > 5);
      assert.ok(typeof r.connection_qualification_notes === 'string' && r.connection_qualification_notes.length > 10);
    }
  });
});
