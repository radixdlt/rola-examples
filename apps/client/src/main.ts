import "./style.css";
import typescriptLogo from "./typescript.svg";
import radixLogo from "/radix-icon_128x128.png";
import {
  DataRequestBuilder,
  RadixDappToolkit,
} from "@radixdlt/radix-dapp-toolkit";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://github.com/radixdlt/radix-dapp-toolkit" target="_blank">
      <img src="${radixLogo}" class="logo" alt="Radix logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Radix dApp Toolkit + TypeScript</h1>
    <radix-connect-button></radix-connect-button>
    <pre id="rola-result"></pre>
    <p class="read-the-docs">
      Click on the Radix and TypeScript logos to learn more
    </p>
  </div>
`;

const radixDappToolkit = RadixDappToolkit({
  dAppDefinitionAddress:
    "account_tdx_d_12xxwkx4fmz680e9wz8atdnyslr9vt7x9qvcfxhtqfnpfhxyjzwtyna",
  networkId: 13,
});

// Clear the dApp state for example purposes
setTimeout(() => {
  radixDappToolkit.disconnect();
});

radixDappToolkit.walletApi.setRequestData(
  DataRequestBuilder.persona().withProof(),
  DataRequestBuilder.accounts().atLeast(1).withProof()
);

const getChallenge: () => Promise<string> = () =>
  fetch("http://localhost:3000/create-challenge")
    .then((res) => res.json())
    .then((res) => res.challenge);

radixDappToolkit.walletApi.provideChallengeGenerator(getChallenge);

const rolaResultElement = document.getElementById("rola-result")!;

radixDappToolkit.walletApi.dataRequestControl(async ({ proofs }) => {
  const { valid } = await fetch("http://localhost:3000/verify", {
    method: "POST",
    body: JSON.stringify(proofs),
    headers: { "content-type": "application/json" },
  }).then((res): Promise<{ valid: boolean }> => res.json());

  rolaResultElement.innerHTML = JSON.stringify(
    proofs.map((item) => ({ ...item, rolaVerified: valid })),
    null,
    2
  );
});
