context('My First Test', () => {
  before(() => {
      // visit the wolt webpage
      cy.visit('https://wolt.com')
  })

  it('Testing for the wolt webpage', () => {
    //click the button to pick the country and verify the contry is lithuania
    cy.get('.GLQS8M').eq(1).click({force:true})
    cy.get('[data-test-id="front-country-link-LTU"]').click({force:true})
    cy.location('pathname').should('eq','/en/ltu')

    //click the button to pick the city and verify the city is kaunas
    cy.get('a[href*="kaunas"]').click({force:true})
    cy.location('pathname').should('eq','/en/ltu/kaunas')
    cy.get('[data-test-id^="header.address"]').contains("Kaunas")

    //enter the Kauno Dokas address
    cy.get('button[aria-haspopup="dialog"]').eq(0).click({force:true})
    cy.get('button[data-localization-key="gdpr-consents.banner.accept-button"]').click({force:true}) // get rid of the banner
    cy.get('select[data-test-id="CountriesSelect"]').select('LTU').invoke('val').should('eq','LTU')
    cy.get('input[data-test-id="AddressQueryInput"]').type('Kauno Dokas')
    cy.wait(2000) //wait for the autocomplete feature
    cy.get('input[data-test-id="AddressQueryInput"]').type("{downArrow}{enter}")
      .invoke('attr','value').should('eq','Kauno Dokas, 44192, Kaunas, Lithuania')
    cy.get('button[data-test-id^="AddressPicker"]').click({force:true})

    //click the restaurant button and verify the page
    cy.get('[class$="llwORD"]').eq(0).click({force:true})
    cy.get('[data-test-id^="Discovery"]').should('contain','Restaurants')

    //click the button to choose burger and verify the page is in Burger
    cy.get('[aria-label^="Burger"]').eq(0).click({force:true})
    cy.get('[data-test-id^="Discovery"]').should('contain','Burger')

    //pick the McDonald restaurant verify it is the right page
    cy.get('[aria-label^="McDonald"]').eq(0).click({force:true})
    cy.get('[data-test-id^="venue-hero"]').should('contain','McDonald')

    //pick some foods from the menu
    cy.get('button[class$="bwpBYg"]').contains('Kompleksai trims.').click({force:true})
    cy.get('button[data-test-id^="product-modal"]').contains('Add to order').click({force:true})
    cy.get('button[class$="bwpBYg"]').contains('10 mėsainių su sūriu').click({force:true})
    cy.get('button[data-test-id^="product-modal"]').contains('Add to order').click({force:true})


    //check the cart for the item and the price
    cy.get('button[data-test-id$="view-button"]').eq(0).should('be.visible').click('center',{force:true})
    cy.get('[class="sc-c3fd15b2-2 kPArvQ"]').children().should('contain','Kompleksai trims.').and('contain','10 mėsainių su sūriu')
    cy.get('[class="sc-bd015adf-1 dRDGXm"]').should('have.text','€33.50')

    //remove an item and check if the item is remove and the price is correct
    cy.get('[data-value="6569438d34c80f5eb6551a3c"]').within( () => {
      cy.get('button[aria-label="Remove item"]').click({force:true})
    })
    cy.get('[class="sc-c3fd15b2-2 kPArvQ"]').children().contains('10 mėsainių su sūriu').should('not.exist')
    cy.get('[class="sc-bd015adf-1 dRDGXm"]').should('have.text','€20.00')

    //proceed to check out
    cy.get('button[data-test-id$="NextStepButton"]').should('be.visible').click('center',{force:true})
    cy.get('input[name="email"]').type("example@hotmail.com")
    cy.get('button[data-test-id="StepMethodSelect.NextButton"]').click({force:true})
    cy.wait(5000)//wait for the page to show that the confirmation email is sent
    
  })

})