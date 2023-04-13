[![Contract CI](https://github.com/cyri113/social-xp/actions/workflows/contract-ci.yml/badge.svg)](https://github.com/cyri113/social-xp/actions/workflows/contract-ci.yml)

# social-xp
Telegram bot for providing on-chain rewards for community members.

## smart contract functions

- [ ] owner
- [ ] mint(to, amount)
- [ ] burn(amount)
- [ ] burnFrom(account, amount)
- [ ] connect(memberId, account)
- [ ] sort(ascending)
- [ ] position(account)

## bot commands

- [ ] /mint <number> <address>
- [ ] /burn <number> <address>
- [ ] /connect <address>
- [ ] /top10
- [ ] /score <address>
- [ ] /me

## how to deploy

### smart contracts
- configure hardhat.config.ts
- run `npx hardhat run scripts/deploy.ts`

### web app
- deploy using deno deploy
