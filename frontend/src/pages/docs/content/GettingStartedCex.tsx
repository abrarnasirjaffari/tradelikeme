import { DocPage, DocSection, DocBadge, DocH1, DocH2, DocP, DocUl, DocDivider, DocCallout, DocTable } from '../DocComponents'

export default function GettingStartedCex() {
  return (
    <DocPage>
      <DocSection>
        <DocBadge color="#0052FF">Investors</DocBadge>
        <DocH1>Getting Started — CEX API</DocH1>
        <DocP>
          Mode B connects the agent to your existing centralized exchange account via a trade-only API key. No crypto wallet needed. No blockchain transactions. The agent trades on your behalf using your exchange balance.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Supported exchanges</DocH2>
        <DocTable
          headers={['Exchange', 'Status', 'Pairs']}
          rows={[
            ['WEEX', 'Live', '600+ USDT perpetuals'],
            ['Bybit', 'Coming soon', '400+ USDT perpetuals'],
            ['Binance', 'Coming soon', '300+ USDT perpetuals'],
          ]}
        />
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Creating a trade-only API key on WEEX</DocH2>
        <DocUl items={[
          '1. Log in to your WEEX account at weex.com',
          '2. Go to Account → API Management',
          '3. Click "Create API Key"',
          '4. Label it "TradeLikeMe" (for your reference)',
          '5. Enable permissions: Trade only',
          '6. Leave "Withdraw" unchecked — this is critical',
          '7. Set IP whitelist: 54.179.141.76 (TradeLikeMe EC2 server)',
          '8. Save your API Key, Secret Key, and Passphrase — you will need all three',
        ]} />
        <DocCallout type="warning">
          Never enable withdrawal permissions on the API key. TradeLikeMe only needs trade access. If you accidentally enable withdrawals, delete the key and create a new one.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Adding the key to TradeLikeMe</DocH2>
        <DocUl items={[
          '1. Visit tradelikeme.xyz and sign in (email, Google, or GitHub)',
          '2. Go to Settings → Exchange Connections',
          '3. Select WEEX and click "Add API Key"',
          '4. Paste your API Key, Secret Key, and Passphrase',
          '5. Click "Verify" — we test the connection with a balance read',
          '6. Go to Strategies → browse and select a strategy',
          '7. Choose your risk mode and click "Start Following"',
          '8. Done. The agent will begin trading on your next zone refresh.',
        ]} />
        <DocCallout type="info">
          Your API key is encrypted immediately on entry — it is never stored in plaintext and is not visible to anyone after you save it.
        </DocCallout>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Removing access</DocH2>
        <DocP>
          To disconnect the agent, go to Settings → Exchange Connections and click "Remove". This deletes the key from our system. To fully revoke access, also delete the API key from your exchange's API Management page.
        </DocP>
      </DocSection>

      <DocDivider />

      <DocSection>
        <DocH2>Minimum balance</DocH2>
        <DocP>
          The agent requires at least $35 available balance to place new trades. This floor prevents over-trading at very low balances. If your balance falls below $35, entries pause automatically and you receive a Telegram alert.
        </DocP>
      </DocSection>
    </DocPage>
  )
}
