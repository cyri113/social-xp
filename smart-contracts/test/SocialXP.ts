import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("SocialXP", function () {

    async function deploy() {
        const [owner, relay, treasury, projectOwner, projectMember, attacker] = await ethers.getSigners();

        const Contract = await ethers.getContractFactory("SocialXP");
        const contract = await Contract.deploy(relay.address, treasury.address)

        return { contract, owner, relay, treasury, projectOwner, projectMember, attacker }
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
        it("should transfer 90% of deposit to relay", async function () {
            const { contract, relay } = await loadFixture(deploy)
            await expect(contract.deposit('chat_id', { value: 100 })).to.changeEtherBalance(relay, 90)
        })
        it("should transfer 10% of deposit to treasury", async function () {
            const { contract, treasury } = await loadFixture(deploy)
            await expect(contract.deposit('chat_id', { value: 100 })).to.changeEtherBalance(treasury, 10)
        })
        it("should increase the project deposit by 90% of the deposit", async function () {
            const { contract } = await loadFixture(deploy)
            expect((await contract.projects('chat_id')).deposit).to.eq(0)
            await contract.deposit('chat_id', { value: 100 })
            expect((await contract.projects('chat_id')).deposit).to.eq(90)
            await contract.deposit('chat_id', { value: 100 })
            expect((await contract.projects('chat_id')).deposit).to.eq(180)
        })
        describe("Events", function () {
            it("should emit Deposit event", async function () {
                const { contract, owner } = await loadFixture(deploy)
                await expect(contract.deposit('chat_id', { value: 100 })).to.emit(contract, "Deposit").withArgs(
                    'chat_id', 100, owner.address
                )
            })
        })
    })

    describe("Set project owner", function () {
        it("should set the project owner", async function () {
            const { contract, relay, projectOwner } = await loadFixture(deploy)
            expect((await contract.projects('chat_id')).owner).to.eq(ethers.constants.AddressZero)
            await contract.connect(relay).setProjectOwner('chat_id', projectOwner.address)
            expect((await contract.projects('chat_id')).owner).to.eq(projectOwner.address)
        })
        describe("Validation", function () {
            it("should revert if not relay", async function () {
                const { contract, projectOwner } = await loadFixture(deploy)
                await expect(contract.setProjectOwner('chat_id', projectOwner.address)).to.be.revertedWith(
                    'Caller is not the relay'
                )
            })
            it("should revert if update interval is less than 24h", async function () {
                const { contract, relay, projectOwner } = await loadFixture(deploy)
                await contract.connect(relay).setProjectOwner('chat_id', projectOwner.address)
                await expect(contract.connect(relay).setProjectOwner('chat_id', projectOwner.address)).to.be.revertedWith(
                    'Can only update every 24 hours'
                )
            })
        })
        describe("Events", function () {
            it("should emit SetProjectOwner event", async function () {
                const { contract, relay, projectOwner } = await loadFixture(deploy)
                await expect(contract.connect(relay).setProjectOwner('chat_id', projectOwner.address)).to.emit(contract, "SetProjectOwner").withArgs(
                    'chat_id', projectOwner.address
                )
            })
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