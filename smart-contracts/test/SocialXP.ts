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
            await expect(contract.deposit('projectId', { value: 100 })).to.changeEtherBalance(relay, 90)
        })
        it("should transfer 10% of deposit to treasury", async function () {
            const { contract, treasury } = await loadFixture(deploy)
            await expect(contract.deposit('projectId', { value: 100 })).to.changeEtherBalance(treasury, 10)
        })
        it("should increase the project deposit by 90% of the deposit", async function () {
            const { contract } = await loadFixture(deploy)
            expect((await contract.projects('projectId')).deposit).to.eq(0)
            await contract.deposit('projectId', { value: 100 })
            expect((await contract.projects('projectId')).deposit).to.eq(90)
            await contract.deposit('projectId', { value: 100 })
            expect((await contract.projects('projectId')).deposit).to.eq(180)
        })
        it("should set the project deposit timestamp")
        describe("Validations", function () {
            it("should revert if projectId_ is empty", async function () {
                const { contract } = await loadFixture(deploy)
                await expect(contract.deposit('', { value: 100 })).to.be.revertedWith(
                    'projectId_ cannot be empty'
                )
            })
            it("should revert if the value is 0", async function () {
                const { contract } = await loadFixture(deploy)
                await expect(contract.deposit('projectId')).to.be.revertedWith(
                    'value cannot be 0'
                )
            })
        })
        describe("Events", function () {
            it("should emit Deposit event", async function () {
                const { contract, owner } = await loadFixture(deploy)
                await expect(contract.deposit('projectId', { value: 100 })).to.emit(contract, "Deposit").withArgs(
                    'projectId', 100, owner.address
                )
            })
        })
    })

    describe("Set project owner", function () {
        it("should set the project owner", async function () {
            const { contract, relay, projectOwner } = await loadFixture(deploy)
            expect((await contract.projects('projectId')).owner).to.eq(ethers.constants.AddressZero)
            await contract.connect(relay).setProjectOwner('projectId', projectOwner.address)
            expect((await contract.projects('projectId')).owner).to.eq(projectOwner.address)
        })
        it("should set the project owner timestamp")
        describe("Validation", function () {
            it("should revert if not relay", async function () {
                const { contract, projectOwner } = await loadFixture(deploy)
                await expect(contract.setProjectOwner('projectId', projectOwner.address)).to.be.revertedWith(
                    'caller is not the relay'
                )
            })
            it("should revert if update interval is less than 24h", async function () {
                const { contract, relay, projectOwner } = await loadFixture(deploy)
                await contract.connect(relay).setProjectOwner('projectId', projectOwner.address)
                await expect(contract.connect(relay).setProjectOwner('projectId', projectOwner.address)).to.be.revertedWith(
                    'can only update every 24 hours'
                )
            })
            it("should revert if projectId_ is empty", async function () {
                const { contract, relay, projectOwner } = await loadFixture(deploy)
                await expect(contract.connect(relay).setProjectOwner('', projectOwner.address)).to.be.revertedWith(
                    'projectId_ cannot be empty'
                )
            })
        })
        describe("Events", function () {
            it("should emit SetProjectOwner event", async function () {
                const { contract, relay, projectOwner } = await loadFixture(deploy)
                await expect(contract.connect(relay).setProjectOwner('projectId', projectOwner.address)).to.emit(contract, "SetProjectOwner").withArgs(
                    'projectId', projectOwner.address
                )
            })
        })
    })

    describe("Set project member", function () {
        it("should set the address for a member id", async function () {
            const { contract, relay, projectMember } = await loadFixture(deploy)
            expect((await contract.getProjectMember('projectId', 'memberId'))[0]).to.eq(ethers.constants.AddressZero)
            await contract.connect(relay).setProjectMember('projectId', 'memberId', projectMember.address)
            expect((await contract.getProjectMember('projectId', 'memberId'))[0]).to.eq(projectMember.address)
        })
        it("should set the member timestamp")
        describe("Validation", function () {
            it("should revert if not relay", async function () {
                const { contract, projectMember } = await loadFixture(deploy)
                await expect(contract.setProjectMember('projectId', 'memberId', projectMember.address)).to.be.revertedWith(
                    'caller is not the relay'
                )
            })
            it("should revert if update interval is less than 24h", async function () {
                const { contract, relay, projectMember } = await loadFixture(deploy)
                await contract.connect(relay).setProjectMember('projectId', 'memberId', projectMember.address)
                await expect(contract.connect(relay).setProjectMember('projectId', 'memberId', projectMember.address)).to.be.revertedWith(
                    'can only update every 24 hours'
                )
            })
            it("should revert if projectId_ is empty", async function () {
                const { contract, relay, projectMember } = await loadFixture(deploy)
                await expect(contract.connect(relay).setProjectMember('', 'memberId', projectMember.address)).to.be.revertedWith(
                    'projectId_ cannot be empty'
                )
            })
            it("should revert if memberId_ is empty", async function () {
                const { contract, relay, projectMember } = await loadFixture(deploy)
                await expect(contract.connect(relay).setProjectMember('projectId', '', projectMember.address)).to.be.revertedWith(
                    'memberId_ cannot be empty'
                )
            })
        })
        describe("Events", function () {
            it("should emit SetProjectMember event", async function () {
                const { contract, relay, projectMember } = await loadFixture(deploy)
                await expect(contract.connect(relay).setProjectMember('projectId', 'memberId', projectMember.address)).to.emit(contract, "SetProjectMember").withArgs(
                    'projectId', 'memberId', projectMember.address
                )
            })
        })
    })

    // describe("Mint")
    // describe("Burn")
    // describe("Rank")
    // describe("Rank")
})