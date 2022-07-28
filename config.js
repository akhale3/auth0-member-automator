'use strict'

module.exports = {
  puppeteerOpts: {
    headless: process.env.HEADLESS === 'true',
  },
  tenantOpts: {
    baseUrl: 'https://manage.auth0.com/dashboard',
    suffixPath: '/tenant/admins',
    landingPagePath: '/us/benchsci',
    owners: (process.env.OWNERS || '').split(','),
    roles: (process.env.ROLES || '').split(','),
  },
}
