'use strict'

const puppeteer = require('puppeteer')
const config = require(`${__dirname}/config`)

const launch = async () => {
  // Launch browser and wait for manual login
  const browser = await puppeteer.launch(config.puppeteerOpts)
  const page = await browser.newPage()
  await page.goto('https://auth0.com/api/auth/login?redirectTo=dashboard')
  await page.waitForFrame(
    `${config.tenantOpts.baseUrl}${config.tenantOpts.landingPagePath}`,
    {
      timeout: 0,
    },
  )

  // Extract CSRF token from window object
  const extractCSRFToken = async () =>
    JSON.parse(
      await page.evaluate(() => JSON.stringify(window.manhattan.config)),
    ).csrf

  // Make API call to send invitations to tenant members
  const addTenantMembers = async ({ headers, data }) => {
    await fetch('https://manage.auth0.com/api/invitations', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    })
  }

  // Switch tenants
  //
  // Note: We use a modern for loop instead of a forEach below as we intend to
  // use await. forEach creates individual instances of the function that are
  // executed independently of each other and, therefore, await cannot suspend
  // their operations to make them operate serially.
  // c.f. https://stackoverflow.com/a/37576787
  for (const tenant of config.tenantOpts.tenants) {
    console.log(`Switching to tenant ${tenant.name}`)

    await page.goto(
      `${config.tenantOpts.baseUrl}${tenant.path}${config.tenantOpts.suffixPath}`,
      { waitUntil: 'networkidle2' },
    )

    await page.evaluate(addTenantMembers, {
      headers: {
        'Content-Type': 'application/json',
        'x-csrftoken': await extractCSRFToken(),
      },
      data: {
        owners: config.tenantOpts.owners,
        // Available roles:
        // ['owners', 'editor-users', 'viewer-config', 'viewer-users']
        roles: config.tenantOpts.roles,
      },
    })
  }

  await browser.close()
}

launch()
