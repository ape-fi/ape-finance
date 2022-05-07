const {
  makeCToken,
} = require('../Utils/Compound');

describe('_setImplementation', function () {
  let root, nonRoot, accounts;
  let cErc20, cCollateralCap, cWrappedNative;
  beforeEach(async () => {
    [root, nonRoot, ...accounts] = saddle.accounts;
    cErc20 = await makeCToken({kind: 'cerc20'});
    cCollateralCap = await makeCToken({kind: 'ccollateralcap'});
    cWrappedNative = await makeCToken({kind: 'cwrapped'});
  });

  describe("cErc20", () => {
    it("changes implementation successfully", async () => {
      cErc20 = await saddle.getContractAt('CErc20Delegator', cErc20._address);

      const newDelegate = await deploy('CErc20Delegate');
      await send(cErc20, '_setImplementation', [newDelegate._address, true, '0x0']);
      expect(await call(cErc20, 'implementation')).toEqual(newDelegate._address);
    });

    it("fails due to non admin", async () => {
      cErc20 = await saddle.getContractAt('CErc20Delegator', cErc20._address);

      const newDelegate = await deploy('CErc20Delegate');
      await expect(send(cErc20, '_setImplementation', [newDelegate._address, true, '0x0'], { from: nonRoot })).rejects.toRevert("revert CErc20Delegator::_setImplementation: Caller must be admin");
    });

    it("fails to change to other version", async () => {
      cErc20 = await saddle.getContractAt('CErc20Delegator', cErc20._address);

      let newDelegate = await deploy('CCollateralCapErc20Delegate');
      await expect(send(cErc20, '_setImplementation', [newDelegate._address, true, '0x0'])).rejects.toRevert('revert mismatch version');

      newDelegate = await deploy('CWrappedNativeDelegate');
      await expect(send(cErc20, '_setImplementation', [newDelegate._address, true, '0x0'])).rejects.toRevert('revert mismatch version');
    });
  });

  describe("cCollateralCapErc20", () => {
    it("changes implementation successfully", async () => {
      cCollateralCap = await saddle.getContractAt('CCollateralCapErc20Delegator', cCollateralCap._address);

      const newDelegate = await deploy('CCollateralCapErc20Delegate');
      await send(cCollateralCap, '_setImplementation', [newDelegate._address, true, '0x0']);
      expect(await call(cCollateralCap, 'implementation')).toEqual(newDelegate._address);
    });

    it("fails due to non admin", async () => {
      cCollateralCap = await saddle.getContractAt('CCollateralCapErc20Delegator', cCollateralCap._address);

      const newDelegate = await deploy('CCollateralCapErc20Delegate');
      await expect(send(cCollateralCap, '_setImplementation', [newDelegate._address, true, '0x0'], { from: nonRoot })).rejects.toRevert("revert CCollateralCapErc20Delegator::_setImplementation: Caller must be admin");
    });

    it("fails to change to other version", async () => {
      cCollateralCap = await saddle.getContractAt('CCollateralCapErc20Delegator', cCollateralCap._address);

      let newDelegate = await deploy('CErc20Delegate');
      await expect(send(cCollateralCap, '_setImplementation', [newDelegate._address, true, '0x0'])).rejects.toRevert('revert mismatch version');

      newDelegate = await deploy('CWrappedNativeDelegate');
      await expect(send(cCollateralCap, '_setImplementation', [newDelegate._address, true, '0x0'])).rejects.toRevert('revert mismatch version');
    });
  });

  describe("cWrappedNative", () => {
    it("changes implementation successfully", async () => {
      cWrappedNative = await saddle.getContractAt('CWrappedNativeDelegator', cWrappedNative._address);

      const newDelegate = await deploy('CWrappedNativeDelegate');
      await send(cWrappedNative, '_setImplementation', [newDelegate._address, true, '0x0']);
      expect(await call(cWrappedNative, 'implementation')).toEqual(newDelegate._address);
    });

    it("fails due to non admin", async () => {
      cWrappedNative = await saddle.getContractAt('CWrappedNativeDelegator', cWrappedNative._address);

      const newDelegate = await deploy('CWrappedNativeDelegate');
      await expect(send(cWrappedNative, '_setImplementation', [newDelegate._address, true, '0x0'], { from: nonRoot })).rejects.toRevert("revert CWrappedNativeDelegator::_setImplementation: Caller must be admin");
    });

    it("fails to change to other version", async () => {
      cWrappedNative = await saddle.getContractAt('CWrappedNativeDelegator', cWrappedNative._address);

      let newDelegate = await deploy('CErc20Delegate');
      await expect(send(cWrappedNative, '_setImplementation', [newDelegate._address, true, '0x0'])).rejects.toRevert('revert mismatch version');

      newDelegate = await deploy('CCollateralCapErc20Delegate');
      await expect(send(cWrappedNative, '_setImplementation', [newDelegate._address, true, '0x0'])).rejects.toRevert('revert mismatch version');
    });
  });
});
