"use Client"

import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;

describe("example tests", () => {
  let content = "Hello Stacks Devs!"

  it("allows user to add a new message", () => {
    let currentBurnBlockHeight = simnet.burnBlockHeight;

    let confirmation = simnet.callPublicFn(
      "stacks-dev-quickstart-message-board",
      "add-message",
      [Cl.stringUtf8(content)],
      address1
    )

    const messageCount = simnet.getDataVar("stacks-dev-quickstart-message-board", "message-count");
    
    expect(confirmation.result).toHaveClarityType(ClarityType.ResponseOk);
    expect(confirmation.result).toBeOk(messageCount);    
    expect(confirmation.events[1].data.value).toBeTuple({
      author: Cl.standardPrincipal(address1),
      event: Cl.stringAscii("[Stacks Dev Quickstart] New Message"),
      id: messageCount,
      message: Cl.stringUtf8(content),
      time: Cl.uint(currentBurnBlockHeight),
    });
  });

  it("allows contract owner to withdraw funds", () => {
    simnet.callPublicFn(
      "stacks-dev-quickstart-message-board",
      "add-message",
      [Cl.stringUtf8(content)],
      address1
    )
    
    simnet.mineEmptyBurnBlocks(2);

    let confirmation = simnet.callPublicFn(
      "stacks-dev-quickstart-message-board",
      "withdraw-funds",
      [],
      deployer
    )
    
    expect(confirmation.result).toBeOk(Cl.bool(true));
    expect(confirmation.events[0].event).toBe("ft_transfer_event")
    expect(confirmation.events[0].data).toMatchObject({
      amount: '1',
      asset_identifier: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token::sbtc-token',
      recipient: deployer,
      sender: `${deployer}${".stacks-dev-quickstart-message-board"}`,
    })
  })
});
