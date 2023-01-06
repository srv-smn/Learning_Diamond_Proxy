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
    let professionalDetails
    let tx
    let receipt
    let result
    const addresses = []
    let owner, firstUser;

    before(async function () {
        [owner, firstUser] = await ethers.getSigners();
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
    
      it('should replace getMyName and add new state variables function', async () => {
        const PersonalDetailsV1 = await ethers.getContractFactory('PersonalDetailsV1')
        personalDetailsV1 = await PersonalDetailsV1.deploy()
        await personalDetailsV1.deployed()
        addresses.push(personalDetailsV1.address)

      let selectors = getSelectors(personalDetailsV1).get(['getMyName()'])
      const selectors1 = getSelectors(personalDetailsV1).remove(['getMyName()'])
      const testFacetAddress = personalDetailsV1.address
      tx = await diamondCutFacet.diamondCut(
        [{
          facetAddress: testFacetAddress,
          action: FacetCutAction.Replace,
          functionSelectors: selectors
        },
        {
            facetAddress: testFacetAddress,
            action: FacetCutAction.Add,
            functionSelectors: selectors1
          }],
        ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
      receipt = await tx.wait()
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`)
      }
      result = await diamondLoupeFacet.facetFunctionSelectors(testFacetAddress)
      assert.sameMembers(result, getSelectors(personalDetailsV1))
      
      //const pd = await ethers.getContractAt('PersonalDetails', professionalDetails.address)
      
      result = await diamondLoupeFacet.facetFunctionSelectors(personalDetails.address)
      assert.sameMembers(result, getSelectors(personalDetails).remove(['getMyName()']))

        personalDetailsV1 = await ethers.getContractAt('PersonalDetailsV1', diamondAddress)
      const name = 'Raven'
      let name_r = await personalDetailsV1.getMyName()
      assert.equal('Mr '+name,name_r)

      const homeTown = 'Bokaro'
      tx = await personalDetailsV1.setMyHomeTown(homeTown)
      await tx.wait()
      let homeTown_r = await personalDetailsV1.getMyHomeTown()
      assert.equal(homeTown,homeTown_r)
    })

    it('should remove some professionalDetails functions', async () => {
      const professionalDetails = await ethers.getContractAt('ProfessionalDetails', diamondAddress)
      const functionsToRemove = ['setMySalary(uint256)']
      const selectors = getSelectors(professionalDetails).get(functionsToRemove)
      tx = await diamondCutFacet.diamondCut(
        [{
          facetAddress: ethers.constants.AddressZero,
          action: FacetCutAction.Remove,
          functionSelectors: selectors
        }],
        ethers.constants.AddressZero, '0x', { gasLimit: 800000 })
      receipt = await tx.wait()
      if (!receipt.status) {
        throw Error(`Diamond upgrade failed: ${tx.hash}`)
      }
      result = await diamondLoupeFacet.facetFunctionSelectors(addresses[4])
      assert.sameMembers(result, getSelectors(professionalDetails).remove(functionsToRemove))
      
      await expect( professionalDetails.setMySalary(600)).revertedWith('FunctionNotFound')
    })

    it('should add a new contract with init and inter-facet communication', async () => {
      const UserDetails = await ethers.getContractFactory('UserDetails')
      userDetails = await UserDetails.deploy()
      await userDetails.deployed()
      addresses.push(userDetails.address)

      const UserDetailsInit = await ethers.getContractFactory('UserDetailsInit')
      userDetailsInit = await UserDetailsInit.deploy()
      await userDetailsInit.deployed()

      let selectors = getSelectors(userDetails)
      const testFacetAddress = userDetails.address

      const userDetailsOwner = firstUser.address;
      let functionCall = userDetailsInit.interface.encodeFunctionData('init',[userDetailsOwner])

      tx = await diamondCutFacet.diamondCut(
          [{
            facetAddress: testFacetAddress,
            action: FacetCutAction.Add,
            functionSelectors: selectors
          }],
          userDetailsInit.address, functionCall, { gasLimit: 800000 })

          receipt = await tx.wait()
          selectors = getSelectors(diamondCutFacet)
          result = await diamondLoupeFacet.facetFunctionSelectors(addresses[0])
          assert.sameMembers(result, selectors)
          selectors = getSelectors(diamondLoupeFacet)
          result = await diamondLoupeFacet.facetFunctionSelectors(addresses[1])
          assert.sameMembers(result, selectors)
          selectors = getSelectors(ownershipFacet)
          result = await diamondLoupeFacet.facetFunctionSelectors(addresses[2])
          assert.sameMembers(result, selectors)

          selectors = getSelectors(personalDetails).remove(['getMyName()'])
          result = await diamondLoupeFacet.facetFunctionSelectors(addresses[3])
          assert.sameMembers(result, selectors)

          selectors = getSelectors(professionalDetails).remove(['setMySalary(uint256)'])
          result = await diamondLoupeFacet.facetFunctionSelectors(addresses[4])
          assert.sameMembers(result, selectors)

          selectors = getSelectors(personalDetailsV1)
          result = await diamondLoupeFacet.facetFunctionSelectors(addresses[5])
          assert.sameMembers(result, selectors)

          selectors = getSelectors(userDetails)
          result = await diamondLoupeFacet.facetFunctionSelectors(addresses[6])
          assert.sameMembers(result, selectors)

  })

  it('test functionality of UserDetails facets', async () => {
      let name = 'Raven'
      let age = 48;
      let companyName = 'RI'
      let salary = 500

      userDetails = await ethers.getContractAt('UserDetails', diamondAddress)
      await expect( userDetails._init(firstUser.address)).revertedWith('already initilised')
      await expect( userDetails.setUserSalary(5000)).revertedWith('only owner can call')
      let response = await userDetails.getUserDetails();

      assert.equal('Mr '+name,response._name)
      assert.equal(age,response._age.toString())
      assert.equal(companyName,response._companyName)
      assert.equal(salary,response._salary.toString())

      let newSalary = 550;
      userDetails.connect(firstUser).setUserSalary(newSalary)

      response = await userDetails.getUserDetails();
      assert.equal(newSalary,response._salary.toString())

      name = 'Samuel'
      age = 50
      companyName = 'Rapid Innovation'
      const tx = await userDetails.setUserDetails(name, age, companyName)
      await tx.wait()

       response = await userDetails.getUserDetails();

      assert.equal('Mr '+name,response._name)
      assert.equal(age,response._age.toString())
      assert.equal(companyName,response._companyName)
      assert.equal(newSalary,response._salary.toString())

  })

  it('test functionality of all facets', async () => {
    personalDetails = await ethers.getContractAt('PersonalDetails', diamondAddress)
    professionalDetails = await ethers.getContractAt('ProfessionalDetails', diamondAddress)
    personalDetailsV1 = await ethers.getContractAt('PersonalDetailsV1', diamondAddress)
    userDetails = await ethers.getContractAt('UserDetails', diamondAddress)

    // personal details get function check

    const name = 'Samuel'
    const age = 50

    let name_r = await personalDetails.getMyName() // this function got called because same sector function is there in diamond but for different facet
    let age_r = await personalDetails.getMyAge()
    assert.equal('Mr '+name,name_r)
    assert.equal(age,age_r)

    // professional details read functions
     name_r = await professionalDetails.getMyCompanyName()
     salary_r = await professionalDetails.getMySalary()
     let companyname = 'Rapid Innovation'
     let salary = 550
    assert.equal(companyname,name_r)
    assert.equal(salary,salary_r)

    // personal details v1 read function
     name_r = await personalDetailsV1.getMyName()
    assert.equal('Mr '+name,name_r)

})


})