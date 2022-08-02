'use strict'

const puppeteer = require('puppeteer')
const config = require(`${__dirname}/config`)

const launch = async () => {
  // Validate inputs
  if (
    !config.tenantOpts.owners.length &&
    !config.tenantOpts.membersToRemove.length
  ) {
    console.log('Please specify at least one owner to add or member to remove')

    return
  }

  // Launch browser and wait for manual login
  const browser = await puppeteer.launch(config.puppeteerOpts)
  const page = await browser.newPage()
  await page.goto('https://auth0.com/api/auth/login?redirectTo=dashboard')
  await page.waitForFrame(
    async (frame) => frame.url().includes(config.tenantOpts.baseUrl),
    {
      timeout: 0,
    },
  )

  // Extract tenants from window object
  const extractTenants = async () =>
    JSON.parse(await page.evaluate(() => JSON.stringify(window.manhattan.user)))
      .tenants

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

  const removeTenantMembers = async ({ headers, membersToRemove }) => {
    const response = await fetch(
      'https://manage.auth0.com/api/authz-tenant-members',
      {
        method: 'GET',
        headers,
      },
    )

    const members = await response.json()
    const filteredMembers = members.filter((member) =>
      membersToRemove.includes(member),
    )

    for (const member of filteredMembers) {
      await fetch(
        `https://manage.auth0.com/api/authorizations/${encodeURIComponent(
          member.id,
        )}`,
        {
          method: 'DELETE',
          headers,
        },
      )
    }
  }

  // Switch tenants

  // The 3 second timeout is deliberately added prior to extracting the
  // tenants to allow the user object to be instantiated in the window object.
  await page.waitForTimeout(3000)
  const tenants = await extractTenants()

  // Note: We use a modern for loop instead of a forEach below as we intend to
  // use await. forEach creates individual instances of the function that are
  // executed independently of each other and, therefore, await cannot suspend
  // their operations to make them operate serially.
  // c.f. https://stackoverflow.com/a/37576787
  for (const tenant of tenants) {
    console.log(`Switching to tenant ${tenant.id}`)

    await page.goto(
      `${config.tenantOpts.baseUrl}/${tenant.locality}/${tenant.id}${config.tenantOpts.suffixPath}`,
      { waitUntil: 'networkidle2' },
    )

    if (config.tenantOpts.owners.length) {
      await page.evaluate(addTenantMembers, {
        headers: {
          'Content-Type': 'application/json',
          'x-csrftoken': await extractCSRFToken(),
        },
        data: {
          owners: config.tenantOpts.owners,
          // Supported roles:
          // ['owners', 'editor-users', 'viewer-config', 'viewer-users']
          roles: config.tenantOpts.roles,
        },
      })
    }

    if (config.tenantOpts.membersToRemove.length) {
      await page.evaluate(removeTenantMembers, {
        headers: {
          'x-csrftoken': await extractCSRFToken(),
        },
        membersToRemove: config.tenantOpts.membersToRemove,
      })
    }
  }

  await browser.close()
}

launch()
