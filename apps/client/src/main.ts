import "./style.css";
import typescriptLogo from "./typescript.svg";
import radixLogo from "/radix-icon_128x128.png";
import {
  DataRequestBuilder,
  RadixDappToolkit,
} from "@radixdlt/radix-dapp-toolkit";

const radixDappToolkit = RadixDappToolkit({
  dAppDefinitionAddress:
    "account_tdx_d_12xxwkx4fmz680e9wz8atdnyslr9vt7x9qvcfxhtqfnpfhxyjzwtyna",
  networkId: 13,
});

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div>
    <a href="https://github.com/radixdlt/radix-dapp-toolkit" target="_blank">
      <img src="${radixLogo}" class="logo" alt="Radix logo" />
    </a>
    <a href="https://www.typescriptlang.org/" target="_blank">
      <img src="${typescriptLogo}" class="logo vanilla" alt="TypeScript logo" />
    </a>
    <h1>Radix dApp Toolkit + TypeScript</h1>
    <div class="card">
      <button id="rola" type="button">Trigger ROLA</button>
    </div>
    <p class="read-the-docs">
      Click on the Radix and TypeScript logos to learn more
    </p>
  </div>
`;

const getChallenge: () => Promise<string> = () =>
  fetch("http://localhost:3000/create-challenge")
    .then((res) => res.json())
    .then((res) => res.challenge);

radixDappToolkit.walletApi.provideChallengeGenerator(getChallenge);

const rolaButtonElement = document.getElementById("rola")!;

rolaButtonElement.addEventListener("click", async () => {
  radixDappToolkit.walletApi.setRequestData(
    DataRequestBuilder.persona().withProof()
  );

  const result = await radixDappToolkit.walletApi.sendRequest();

  if (result.isErr()) return alert(JSON.stringify(result.error, null, 2));

  const [signedChallenge] = result.value.proofs;

  const verifiedResult: { verified: boolean } = await fetch(
    "http://localhost:3000/verify",
    {
      method: "POST",
      body: JSON.stringify(signedChallenge),
      headers: { "content-type": "application/json" },
    }
  ).then((res) => res.json());

  alert(JSON.stringify(verifiedResult, null, 2));
});
