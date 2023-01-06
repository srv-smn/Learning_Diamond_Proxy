const {
    getSelectors,
    FacetCutAction,
    removeSelectors,
    findAddressPositionInFacets
} = require('../scripts/libraries/diamond.js')

const { deployDiamond } = require('../scripts/deploy.js')

const { assert, expect } = require('chai')

describe('Diamond Personal Details', async function () {
    let diamondAddress
    let diamondCutFacet
    let diamondLoupeFacet
    let ownershipFacet
    let personalDetails
    let tx
    let receipt
    let result
    const addresses = []

    before(async function () {
        diamondAddress = await deployDiamond()
        diamondCutFacet = await ethers.getContractAt('DiamondCutFacet', diamondAddress)
        diamondLoupeFacet = await ethers.getContractAt('DiamondLoupeFacet', diamondAddress)
        ownershipFacet = await ethers.getContractAt('OwnershipFacet', diamondAddress)
    })

    it('should have three facets -- call to facetAddresses function', async () => {
        for (const address of await diamondLoupeFacet.facetAddresses()) {
            addresses.push(address)
        }

        assert.equal(addresses.length, 3)
    })

    it('facets should have the right function selectors -- call to facetFunctionSelectors function', async () => {
        let selectors = getSelectors(diamondCutFacet)
        result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0])
        assert.sameMembers(result, selectors)
        selectors = getSelectors(diamondLoupeFacet)
        result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1])
        assert.sameMembers(result, selectors)
        selectors = getSelectors(ownershipFacet)
        result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2])
        assert.sameMembers(result, selectors)
    })

    it('selectors should be associated to facets correctly -- multiple calls to facetAddress function', async () => {
        assert.equal(
            addresses[0],
            await diamondLoupeFacet.facetAddress('0x1f931c1c')
        )
        assert.equal(
            addresses[1],
            await diamondLoupeFacet.facetAddress('0xcdffacc6')
        )
        assert.equal(
            addresses[1],
            await diamondLoupeFacet.facetAddress('0x01ffc9a7')
        )
        assert.equal(
            addresses[2],
            await diamondLoupeFacet.facetAddress('0xf2fde38b')
        )
    })
    /* Diamond deployment process */

    it('should add PersonalDetails functions', async () => {
        const PersonalDetails = await ethers.getContractFactory('PersonalDetails')
        personalDetails = await PersonalDetails.deploy()
        await personalDetails.deployed()
        addresses.push(personalDetails.address)
        const selectors = getSelectors(personalDetails)//.remove(['supportsInterface(bytes4)'])
        tx = await diamondCutFacet.diamondCut(
            [{
                facetAddress: personalDetails.address,
                action: FacetCutAction.Add,
                functionSelectors: selectors
            }],
            ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
        receipt = await tx.wait()
        if (!receipt.status) {
            throw Error(`Diamond upgrade failed: ${tx.hash}`)
        }
        result = await diamondLoupeFacet.facetFunctionSelectors(personalDetails.address)
        assert.sameMembers(result, selectors)
    })

    it('should test PersonalDetails function call', async () => {
        const personalDetails = await ethers.getContractAt('PersonalDetails', diamondAddress)
        const name = 'Raven'
        const age = 48
        const addName = await personalDetails.setMyName(name)
        await addName.wait()
        const addAge = await personalDetails.setMyAge(age)
        await addAge.wait()

        let name_r = await personalDetails.getMyName()
        let age_r = await personalDetails.getMyAge()
        assert.equal(name, name_r)
        assert.equal(age, age_r)

    })

    it('should add ProfessionalDetails functions', async () => {
        const ProfessionalDetails = await ethers.getContractFactory('ProfessionalDetails')
        professionalDetails = await ProfessionalDetails.deploy()
        await professionalDetails.deployed()
        addresses.push(professionalDetails.address)
        const selectors = getSelectors(professionalDetails)//.remove(['supportsInterface(bytes4)'])
        tx = await diamondCutFacet.diamondCut(
          [{
            facetAddress: professionalDetails.address,
            action: FacetCutAction.Add,
            functionSelectors: selectors
          }],
          ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
          receipt = await tx.wait()
        if (!receipt.status) {
          throw Error(`Diamond upgrade failed: ${tx.hash}`)
        }
        result = await diamondLoupeFacet.facetFunctionSelectors(professionalDetails.address)
        assert.sameMembers(result, selectors)
      })

      it('should test ProfessionalDetails function call', async () => {
        const professionalDetails = await ethers.getContractAt('ProfessionalDetails', diamondAddress)
        const companyname = 'RI'
        const salary = 500
        const addName = await professionalDetails.setMyCompanyName(companyname)
        await addName.wait()
        const addSalary = await professionalDetails.setMySalary(salary)
        await addSalary.wait()

        let name_r = await professionalDetails.getMyCompanyName()
        let salary_r = await professionalDetails.getMySalary()
        assert.equal(companyname,name_r)
        assert.equal(salary,salary_r)

      })

})