const assert = require("node:assert/strict");
const { ethers } = require("hardhat");

const H1 = "0x" + "11".repeat(32);
const H2 = "0x" + "22".repeat(32);
const ZERO = "0x" + "00".repeat(32);

async function expectRevert(p, text) {
  await assert.rejects(p, (e) => { assert.match(String(e.message), new RegExp(text)); return true; });
}

describe("ActionRegistry", () => {
  let reg, owner, other;
  beforeEach(async () => {
    [owner, other] = await ethers.getSigners();
    reg = await ethers.deployContract("ActionRegistry");
  });

  it("registers a record and reads it back", async () => {
    await (await reg.register("CS-2026-0001", H1, H2)).wait();
    const [ev, rec, at, exists] = await reg.getRecord("CS-2026-0001");
    assert.equal(ev, H1); assert.equal(rec, H2); assert.equal(exists, true); assert.ok(at > 0n);
  });
  it("emits ActionRegistered", async () => {
    const tx = await reg.register("CS-2026-0002", H1, H2);
    const r = await tx.wait();
    assert.equal(r.logs.length, 1);
    assert.equal(reg.interface.parseLog(r.logs[0]).name, "ActionRegistered");
  });
  it("allows a zero evidence hash (report without photo)", async () => {
    await (await reg.register("CS-2026-0003", ZERO, H2)).wait();
    assert.equal((await reg.getRecord("CS-2026-0003"))[3], true);
  });
  it("rejects duplicate registration of the same ID", async () => {
    await (await reg.register("CS-2026-0004", H1, H2)).wait();
    await expectRevert(reg.register("CS-2026-0004", H2, H1), "Already registered");
  });
  it("only the registrar can register", async () => {
    await expectRevert(reg.connect(other).register("CS-2026-0005", H1, H2), "Only registrar");
  });
  it("rejects empty or oversized IDs and a zero record hash", async () => {
    await expectRevert(reg.register("", H1, H2), "Bad record id");
    await expectRevert(reg.register("x".repeat(65), H1, H2), "Bad record id");
    await expectRevert(reg.register("CS-2026-0006", H1, ZERO), "Record hash required");
  });
  it("reports unknown IDs as not existing", async () => {
    const [, , , exists] = await reg.getRecord("CS-2026-9999");
    assert.equal(exists, false);
  });
});
