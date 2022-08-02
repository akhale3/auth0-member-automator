'use strict'

module.exports = {
  puppeteerOpts: {
    headless: process.env.HEADLESS === 'true',
  },
  tenantOpts: {
    baseUrl: 'https://manage.auth0.com/dashboard',
    suffixPath: '/tenant/admins',
    owners: (process.env.OWNERS || '').split(','),
    roles: (process.env.ROLES || '').split(','),
    membersToRemove: (process.env.MEMBERS_TO_REMOVE || '').split(','),
  },
}
