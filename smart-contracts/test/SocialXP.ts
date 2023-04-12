import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SocialXP", function () {

    async function deploy() {
        const [owner, relay, treasury] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("SocialXP");
        const contract = await Contract.deploy(relay.address, treasury.address)

        return { contract, owner, relay, treasury }
    }

    describe("Deployment", function () {
        it("should have a relay", async function () {
            const { contract, relay } = await loadFixture(deploy)
            expect(await contract.relay()).to.eq(relay.address)
        })
        it("should have a treasury", async function () {
            const { contract, treasury } = await loadFixture(deploy)
            expect(await contract.treasury()).to.eq(treasury.address)
        })
    })

    describe("Deposit ETH", function () {
        it("should transfer 90% of deposit to relay")
        it("should transfer 10% of deposit to treasury")
        it("should increase the project deposit by 90% of the deposit")
    })

    describe("Set project ownership", function () {
        it("should set the owner of the project")
        describe("Validation", function () {
            it("should revert if not relay")
        })
    })

    describe("Connect", function () {
        it("should set the address for a member id")
        it("should set update_at timestamp")
        describe("Validation", function () {
            it("should revert if last update was less than 24h ago.")
        })
    })

    // describe("Mint")
    // describe("Burn")
    // describe("Rank")
    // describe("Rank")
})