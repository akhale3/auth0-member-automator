'use strict'

module.exports = {
  puppeteerOpts: {
    headless: process.env.HEADLESS === 'true',
  },
  tenantOpts: {
    baseUrl: 'https://manage.auth0.com/dashboard',
    suffixPath: '/tenant/admins',
    landingPagePath: '/us/benchsci',
    tenants: [
      {
        name: 'benchsci-idp-mainline',
        path: '/us/benchsci-idp-mainline',
      },
      {
        name: 'benchsci-idp-staging',
        path: '/us/benchsci-idp-staging',
      },
    ],
    owners: (process.env.OWNERS || '').split(','),
    roles: (process.env.ROLES || '').split(','),
  },
}
