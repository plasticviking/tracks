import cors from 'cors';
import http from 'http';
import helmet from 'helmet';
import express from 'express';
import morgan from 'morgan';
import {organizations} from "./apis/admin/organizations";
import {pool} from "./database";
import {CONFIG} from "./config";
import {jwksMiddleware} from "./jwt";
import {common} from "./apis/common";
import {users} from "./apis/admin/users";
import {regions} from "./apis/admin/regions";
import {officers} from './apis/admin/officers';
import {reports} from './apis/admin/reports';

import {activities as officerActivities} from "./apis/officer/activities";
import {reports as officerReports} from './apis/officer/reports';

import {activities as operatorTravelPaths} from "./apis/operator/activities";
import {reports as operatorReports} from './apis/operator/reports';
import {tenures as operatorTenures} from "./apis/operator/tenures";
import {permits as operatorPermits} from "./apis/operator/permits";

import {reports as licenseAuthOfficerReports} from './apis/license_auth_officer/reports';
import {tenures as licenseAuthOfficerTenures} from './apis/license_auth_officer/tenures';

import {reports as areaAdminReports} from './apis/area_admin/reports';
import {permits as areaAdminPermits} from './apis/area_admin/permits';

import {reportingPeriods} from "./apis/shared/reporting_periods";


import {MinioService} from "./services/minio_service";

const prefix = '/api/v1';


const jwks = jwksMiddleware({jwksUri: CONFIG.JWKS_URL});

const app = express()
  .use(helmet())
  .use(cors())
  .use(morgan('tiny'))
  .use(express.json())

  .get(`${prefix}/admin/organizations`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), organizations.list)

  .get(`${prefix}/admin/operators`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), organizations.operators)

  .get(`${prefix}/admin/organizations/:id`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), organizations.view)

  .get(`${prefix}/admin/operators/:id`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), organizations.view)

  .get(`${prefix}/admin/officers`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), officers.list)

  .get(`${prefix}/admin/officers/:id`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), officers.view)

  .get(`${prefix}/admin/reports`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), reports.list)

  .get(`${prefix}/admin/regions`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), regions.list)

  .get(`${prefix}/admin/users`, jwks.protect({
    requireRole: 'admin',
    requireOrganizationMapping: true
  }), users.list)

  .get(`${prefix}/officer/reports`, jwks.protect({
    requireRole: 'conservation_officer',
    requireOrganizationMapping: true
  }), officerReports.list)

  .get(`${prefix}/officer/activities`, jwks.protect({
    requireRole: 'conservation_officer',
    requireOrganizationMapping: true
  }), officerActivities.list)

  .get(`${prefix}/officer/activities/:id`, jwks.protect({
    requireRole: 'conservation_officer',
    requireOrganizationMapping: true
  }), officerActivities.view)

  .get(`${prefix}/operator/reports`, jwks.protect({
    requireRole: 'commercial_operator',
    requireOrganizationMapping: true
  }), operatorReports.list)

  .get(`${prefix}/operator/activities/upload_request`, jwks.protect({
    requireRole: 'commercial_operator',
    requireOrganizationMapping: true
  }), operatorTravelPaths.generateUploadRequest)

  .get(`${prefix}/operator/activities`, jwks.protect({
    requireRole: 'commercial_operator',
    requireOrganizationMapping: true
  }), operatorTravelPaths.list)

  .get(`${prefix}/operator/activities/:id`, jwks.protect({
    requireRole: 'commercial_operator',
    requireOrganizationMapping: true
  }), operatorTravelPaths.view)

  .post(`${prefix}/operator/activities`, jwks.protect({
    requireRole: 'commercial_operator',
    requireOrganizationMapping: true
  }), operatorTravelPaths.add)

  .get(`${prefix}/operator/permits`, jwks.protect({
    requireRole: 'commercial_operator',
    requireOrganizationMapping: true
  }), operatorPermits.list)

  .get(`${prefix}/operator/tenures`, jwks.protect({
    requireRole: 'commercial_operator',
    requireOrganizationMapping: true
  }), operatorTenures.list)

  .get(`${prefix}/area_admin/reports`, jwks.protect({
    requireRole: 'area_admin',
    requireOrganizationMapping: true
  }), areaAdminReports.list)

  .get(`${prefix}/area_admin/permits`, jwks.protect({
    requireRole: 'area_admin',
    requireOrganizationMapping: true
  }), areaAdminPermits.list)

  .get(`${prefix}/license_auth_officer/reports`, jwks.protect({
    requireRole: 'license_auth_officer',
    requireOrganizationMapping: true
  }), licenseAuthOfficerReports.list)

  .get(`${prefix}/license_auth_officer/tenures`, jwks.protect({
    requireRole: 'license_auth_officer',
    requireOrganizationMapping: true
  }), licenseAuthOfficerTenures.list)


  .get(`${prefix}/shared/reporting_periods`, jwks.protect({
    requireAnyRole: ['license_auth_officer', 'admin', 'area_admin', 'commercial_operator', 'conservation_officer'],
    requireOrganizationMapping: true
  }), reportingPeriods.list)


  .get('*', common.notFound);

app.options('*', cors());

const server = http.createServer(app);
const minio = MinioService;

server.listen(CONFIG.LISTEN_PORT, () => {
  console.log(`listening on port ${CONFIG.LISTEN_PORT}`);

  pool.connect().then((client) => {
    console.log('Database connection ok');
    client.release();
  }).catch(err => {
    console.error(`database connection error: ${err}, shutting down`);
    server.close();
  });

  minio.testConnection().catch(err => {
    console.error(err);
    console.error('Minio connection failed. Check configuration');
    server.close();
  });

});
