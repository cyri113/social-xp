import { Head } from "$fresh/runtime.ts";
import CopyButton from "../islands/CopyButton.tsx";

export default function Home() {

  return (
    <>
      <Head>
        <title>Social XP - Telegram Bot Rewards</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md mt-16">
        <div className='flex flex-col gap-4'>

          <h1 className='text-4xl font-bold'>Social XP</h1>
          <h2 className='text-gray-500 text-xl'>Telegram bot for providing on-chain rewards for community members.</h2>
          <p className='text-gray-500'>SocialXP is currently under construction 🏗️.</p>
          <p className='text-gray-500'>Join our <a class={'hover:underline text-blue-600 font-semibold'} href='https://t.me/+OUQ9MU8YpJ02ZDY8'>Telegram Group</a> if you have questions.</p>

          <h3 class={'text-gray-900 font-bold text-2xl mt-6'}>Getting Started</h3>
          <p className='text-gray-500'>We will now configure SocialXP to work in your Telegram group.</p>

          <h4 class={'text-gray-900 font-bold text-xl mt-4'}>Add bot to chat</h4>
          <p class={'text-gray-500'}>Our first step is to add the <a class={'hover:underline text-blue-600 font-semibold'} href="https://t.me/social_xp_bot">Social XP Bot 🤖</a> to your chat group.</p>
          <ul className={'text-gray-500 list-decimal list-inside flex flex-col gap-4'}>
            <li>In your chat group settings, click the [Add] button and search for @social_xp_bot.</li>
          </ul>

          <h4 class={'text-gray-900 font-bold text-xl mt-4'}>Add credit (gas ain't free ⛽️)</h4>
          <p class={'text-gray-500'}>SocialXP is decentralized, and therefore requires writing to the blockchain, unfortunately this costs gas. SocialXP allows you to load gas credits in order to pay for future transactions. It operates on a pay-as-you-go basis, and you can get a refund on unused gas whenever you wish. There is a 10% commission which goes to maintaining SocialXP.</p>
          <ul className={'text-gray-500 list-decimal list-inside flex flex-col gap-4'}>
            <li>In your telegram group, run the command:</li>
            <CopyButton text="/credit" />
            <li>Click on the URL generated and add some gas fee credits.</li>
            <li>Once added, re-run the command and you should see that the credit was added.</li>
          </ul>

          <h4 class={'text-gray-900 font-bold text-xl mt-4'}>Connecting an address</h4>
          <p class={'text-gray-500'}>In order to reward community members with tokens, they will need to connect their address to SocialXP.</p>
          <ul className={'text-gray-500 list-decimal list-inside flex flex-col gap-4'}>
            <li>In your telegram group, run the command:</li>
            <CopyButton text="/connect <address>" />
            <li>This will create a transaction that connects your members id to the address entered. In order to avoid abuse (draining of your precious credits), members can only change addresses once a day.</li>
            <li>Once added, run the following command to see the address connected to an account:</li>
            <CopyButton text="/me" />
          </ul>

          <h4 class={'text-gray-900 font-bold text-xl mt-4'}>Minting reward tokens</h4>
          <p class={'text-gray-500'}>You can reward your members at anytime by minting tokens. Note that only the <span class={'underline'}>group creator</span> is allowed to mint new tokens for their community members.</p>
          <ul className={'text-gray-500 list-decimal list-inside flex flex-col gap-4'}>
            <li>In your telegram group, run the command:</li>
            <CopyButton text="/mint <amount> <user>" />
            <li>This will mint the tokens to the address associated to that member.</li>
            <li>The bot will respond with a transaction hash.</li>
          </ul>

          <h4 class={'text-gray-900 font-bold text-xl mt-4'}>Burning reward tokens</h4>
          <p class={'text-gray-500'}>You can punish your members at anytime by burning their tokens. Note that only the <span class={'underline'}>group creator</span> is allowed to mint new tokens for their community members.</p>
          <ul className={'text-gray-500 list-decimal list-inside flex flex-col gap-4'}>
            <li>In your telegram group, run the command:</li>
            <CopyButton text="/burn <amount> <user>" />
            <li>This will burn the tokens belonging to the address associated to that member.</li>
            <li>The bot will respond with a transaction hash.</li>
          </ul>

          <h3 class={'text-gray-900 font-bold text-2xl mt-6'}>Commands</h3>

          <div class={'my-4 flex flex-col gap-2 text-gray-500'}>
            <CopyButton text='/credit' />
            <p class={'text-gray-500 px-4'}>Shows amount of credit associated to the chat group has and a management URL to add or remove credit.</p>
          </div>
          <div class={'my-4 flex flex-col gap-2 text-gray-500'}>
            <CopyButton text='/connect <address>' />
            <p class={'text-gray-500 px-4'}>Associates a give address to the user that enters the command. Users can change their address maximum once a day.</p>
          </div>

          <div class={'my-4 flex flex-col gap-2 text-gray-500'}>
            <CopyButton text='/mint <amount> <user>' />
            <p class={'text-gray-500 px-4'}>Reward members at anytime by minting tokens. Note that only the <span class={'underline'}>group creator</span> is allowed to mint new tokens for their community members.</p>
          </div>

          <div class={'my-4 flex flex-col gap-2 text-gray-500'}>
            <CopyButton text='/burn <amount> <user>' />
            <p class={'text-gray-500 px-4'}>Punish members at anytime by burning their tokens. Note that only the <span class={'underline'}>group creator</span> is allowed to mint new tokens for their community members.</p>
          </div>

          <div class={'my-4 flex flex-col gap-2 text-gray-500'}>
            <CopyButton text='/rank <user>' />
            <p class={'text-gray-500 px-4'}>Displays a users rank and token holdings.</p>
          </div>

          <div class={'my-4 flex flex-col gap-2 text-gray-500'}>
            <CopyButton text='/leadership' />
            <p class={'text-gray-500 px-4'}>Lists the top 10 ranked users and their token holdings.</p>
          </div>

          <div class={'my-4 flex flex-col gap-2 text-gray-500'}>
            <CopyButton text='/me' />
            <p class={'text-gray-500 px-4'}>Displays information about the account that runs the command including rank, holdings, and associated address.</p>
          </div>

          <p class={'my-16 text-gray-500'}>We hope you enjoy SocialXP.</p>
        </div>
      </div>
    </>
  );
}
