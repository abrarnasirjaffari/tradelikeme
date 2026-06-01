import os

def create_component(path, name):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'''import React from 'react';
import {{ View, Text, StyleSheet }} from 'react-native';

export default function {{name}}() {{
  return (
    <View style={{styles.container}}>
      <Text>{{name}} Screen</Text>
    </View>
  );
}}

const styles = StyleSheet.create({{
  container: {{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  }},
}});
'''.replace('{name}', name))

def create_layout(path, name):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f'''import React from 'react';
import {{ Stack }} from 'expo-router';

export default function {{name}}Layout() {{
  return (
    <Stack>
      <Stack.Screen name="index" options={{{{ headerShown: false }}}} />
    </Stack>
  );
}}
'''.replace('{name}', name))

base_dir = r"f:\AgentTeam\hackathon\Platform\mobile"

screens = {
    "app/(auth)/login.tsx": "Login",
    "app/(auth)/signup.tsx": "Signup",
    "app/(auth)/onboarding/slide1.tsx": "OnboardingSlide1",
    "app/(auth)/onboarding/slide2.tsx": "OnboardingSlide2",
    "app/(auth)/onboarding/slide3.tsx": "OnboardingSlide3",
    "app/(tabs)/index.tsx": "Dashboard",
    "app/(tabs)/trades.tsx": "Trades",
    "app/(tabs)/vault.tsx": "Vault",
    "app/(tabs)/strategies.tsx": "Strategies",
    "app/(tabs)/settings.tsx": "Settings",
    "app/trade/[id].tsx": "TradeDetail",
    "app/strategy/[id].tsx": "StrategyDetail",
    "app/notification/[id].tsx": "NotificationDetail",
    "app/referral.tsx": "Referral",
}

components = {
    "components/PnLCard.tsx": "PnLCard",
    "components/TradeRow.tsx": "TradeRow",
    "components/VaultCard.tsx": "VaultCard",
    "components/AgentStatusBadge.tsx": "AgentStatusBadge",
    "components/RiskModePicker.tsx": "RiskModePicker",
    "components/DepositModal.tsx": "DepositModal",
}

for rel_path, name in screens.items():
    create_component(os.path.join(base_dir, rel_path), name)

for rel_path, name in components.items():
    create_component(os.path.join(base_dir, rel_path), name)

create_layout(os.path.join(base_dir, "app/(auth)/_layout.tsx"), "Auth")
create_layout(os.path.join(base_dir, "app/(tabs)/_layout.tsx"), "Tabs")
create_layout(os.path.join(base_dir, "app/_layout.tsx"), "Root")

print("Scaffolding complete.")
