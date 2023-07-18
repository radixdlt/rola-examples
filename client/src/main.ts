import "./style.css";
import typescriptLogo from "./typescript.svg";
import radixLogo from "/radix-icon_128x128.png";
import { RadixDappToolkit } from "@radixdlt/radix-dapp-toolkit";

const radixDappToolkit = RadixDappToolkit({
  dAppDefinitionAddress:
    "account_tdx_21_129e0ffephdq9mtd26rn5m99pq3jwwscggwa8wxnu6pz78lutsw8j7v",
  networkId: 33,
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

const rolaButtonElement = document.getElementById("rola")!;

rolaButtonElement.addEventListener("click", async () => {
  const { challenge }: { challenge: string } = await fetch(
    "http://localhost:3000/create-challenge"
  ).then((res) => res.json());

  const result = await radixDappToolkit.requestData({ challenge });

  if (result.isErr()) return alert(JSON.stringify(result.error, null, 2));

  const signedChallenge = result.value.signedChallenges[0];

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
