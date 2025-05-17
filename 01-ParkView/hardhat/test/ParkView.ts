import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import hre from "hardhat";

describe("ParkView", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    // Contracts are deployed using the first signer/account by default
    // const [owner, otherAccount] = await hre.ethers.getSigners();

    const ParkView = await hre.ethers.getContractFactory("ParkView");
    const parkView = await ParkView.deploy();
    console.log("ParkView deployed to:", parkView.target);
    await parkView.waitForDeployment();
    return parkView;
  }

  describe("Deployment", function () {

    it("获取合约信息", async function () {
      const parkView = await loadFixture(deployOneYearLockFixture);
      // 创造nft token
      const tokenData = {
        id: 0,
        name: "车位1",
        picture: "https://picsum.photos/200/300",   // 随机图片
        location: "北京市朝阳区",
        owner: "0x0000000000000000000000000000000000000000",
        renter: "0x0000000000000000000000000000000000000000",
        rent_end_time: "123654654654646466",
        rent_price: 100,
        rent_status: true,
        longitude: 123,
        latitude: 456,
        create_time: "123654654654646466",
        update_time: "123654654654646466",
        is_property: false
      };
      const tokenId = await parkView.createToken(tokenData);
      // 获取nft token信息
      const tokenInfo = await parkView.getToken(1);
      expect(tokenInfo.name).to.equal(tokenData.name);
      expect(Number(tokenInfo.latitude)).to.equal(tokenData.latitude);
      expect(tokenInfo.location).to.equal(tokenData.location);
      expect(Number(tokenInfo.rent_price)).to.equal(tokenData.rent_price);
    });

    it("更新token信息", async function () {
      const parkView = await loadFixture(deployOneYearLockFixture);
      const [owner, otherAccount] = await hre.ethers.getSigners();

      // 先创建token
      const tokenId = await parkView.createToken({
        id: 1,
        name: "车位1",
        picture: "https://picsum.photos/200/300",
        location: "北京市朝阳区",
        owner: owner.address,
        renter: "0x0000000000000000000000000000000000000000",
        rent_end_time: "123654654654646466",
        rent_price: 100,
        rent_status: true,
        longitude: 123,
        latitude: 456,
        create_time: "123654654654646466",
        update_time: "123654654654646466",
        is_property: false
      });

      // 更新token信息
      await parkView.updateToken(1, {
        id: 1,
        name: "更新后的车位",
        picture: "https://picsum.photos/200/300",
        location: "北京市海淀区",
        owner: owner.address,
        renter: "0x0000000000000000000000000000000000000000",
        rent_end_time: "123654654654646466",
        rent_price: 200,
        rent_status: true,
        longitude: 789,
        latitude: 101,
        create_time: "123654654654646466",
        update_time: "123654654654646466",
        is_property: false
      });

      // 验证更新后的信息
      const tokenInfo = await parkView.getToken(1);
      expect(tokenInfo.name).to.equal("更新后的车位");
      expect(tokenInfo.location).to.equal("北京市海淀区");
      expect(Number(tokenInfo.rent_price)).to.equal(200);
    });

    it("非所有者不能更新token", async function () {
      const parkView = await loadFixture(deployOneYearLockFixture);
      const [owner, otherAccount] = await hre.ethers.getSigners();

      // 先创建token
      await parkView.createToken({
        id: 0,
        name: "车位1",
        picture: "https://picsum.photos/200/300",
        location: "北京市朝阳区",
        owner: owner.address,
        renter: "0x0000000000000000000000000000000000000000",
        rent_end_time: "123654654654646466",
        rent_price: 100,
        rent_status: true,
        longitude: 123,
        latitude: 456,
        create_time: "123654654654646466",
        update_time: "123654654654646466",
        is_property: false
      });

      // 非所有者尝试更新token
      await expect(
        parkView.connect(otherAccount).updateToken(1, {
          id: 0,
          name: "非法更新",
          picture: "https://picsum.photos/200/300",
          location: "北京市海淀区",
          owner: owner.address,
          renter: "0x0000000000000000000000000000000000000000",
          rent_end_time: "123654654654646466",
          rent_price: 200,
          rent_status: true,
          longitude: 789,
          latitude: 101,
          create_time: "123654654654646466",
          update_time: "123654654654646466",
          is_property: false
        })
      ).to.be.revertedWith("You are not the owner of this token.");
    });

    it("获取所有token列表", async function () {
      const parkView = await loadFixture(deployOneYearLockFixture);

      // 创建多个token
      await parkView.createToken({
        id: 1,
        name: "车位1",
        picture: "https://picsum.photos/200/300",
        location: "北京市朝阳区",
        owner: "0x0000000000000000000000000000000000000000",
        renter: "0x0000000000000000000000000000000000000000",
        rent_end_time: "123654654654646466",
        rent_price: 100,
        rent_status: true,
        longitude: 123,
        latitude: 456,
        create_time: "123654654654646466",
        update_time: "123654654654646466",
        is_property: false
      });

      await parkView.createToken({
        id: 2,
        name: "车位2",
        picture: "https://picsum.photos/200/300",
        location: "北京市海淀区",
        owner: "0x0000000000000000000000000000000000000000",
        renter: "0x0000000000000000000000000000000000000000",
        rent_end_time: "123654654654646466",
        rent_price: 200,
        rent_status: true,
        longitude: 789,
        latitude: 101,
        create_time: "123654654654646466",
        update_time: "123654654654646466",
        is_property: false
      });

      // 获取所有token
      const tokens = await parkView.getTokens();
      expect(tokens.length).to.equal(2);
      expect(tokens[0].name).to.equal("车位1");
      expect(tokens[1].name).to.equal("车位2");
      expect(Number(tokens[0].rent_price)).to.equal(100);
      expect(Number(tokens[1].rent_price)).to.equal(200);
    });
  });

  describe("事件", function () {
    it("创建token时触发ParkViewTime事件", async function () {
      const parkView = await loadFixture(deployOneYearLockFixture);

      await expect(parkView.createToken({
        id: 1,
        name: "车位1",
        picture: "https://picsum.photos/200/300",
        location: "北京市朝阳区",
        owner: "0x0000000000000000000000000000000000000000",
        renter: "0x0000000000000000000000000000000000000000",
        rent_end_time: "123654654654646466",
        rent_price: 100,
        rent_status: true,
        longitude: 123,
        latitude: 456,
        create_time: "123654654654646466",
        update_time: "123654654654646466",
        is_property: false
      })).to.emit(parkView, "ParkViewTime");
    });
  });
});



[0,"车位1","https://picsum.photos/200/300","北京市朝阳区","0x0000000000000000000000000000000000000000","0x0000000000000000000000000000000000000000","123654654654646466",100,true,123,456,"123654654654646466","123654654654646466",false]