function settingsComponent(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Kraken Settings</Text>}>
        <Select
          label="Base currency"
          settingsKey="currency"
          options={[
            { name: 'EUR', value: 'ZEUR' },
            { name: 'USD', value: 'ZUSD' }
          ]}
          renderItem={
            (option) =>
              <TextImageRow
                label={option.name}
              />
          }
        />
        {/* <Toggle
          label={`Currency: ${settings.currency}`}
          settingsKey="currency"
          onChange={(value) => { props.settingsStorage.setItem('currency', value === true ? "EUR" : "USD") }}
        /> */}
        <TextInput
          label="API Key"
          title="Enter your Kraken API key here"
          settingsKey="apiKey"
        />
        <TextInput
          label="API Key Secret"
          title="Enter your Kraken API key secret here"
          settingsKey="apiSecret"
          renderItem={
            (value) =>
              <TextImageRow
                label="API Secret"
                sublabel={'*'.repeat(value.length)}
              />
          }
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(settingsComponent);
