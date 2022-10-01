@EndUserText.label: 'YCLC_ASSET_XRATE'
@AccessControl.authorizationCheck: #NOT_REQUIRED

@UI: {
  headerInfo: { typeName: 'Cryto Account',
                typeNamePlural: 'Crypto Accounts',
                title: { type: #STANDARD, label: 'Companycode', value: 'Companycode' } },
  presentationVariant: [{ sortOrder: [{ by: 'CryptoAssetType', direction:  #DESC },{ by: 'Ratetype', direction:  #DESC },{ by: 'EffTimestamp', direction:  #DESC }] }] }
  
 
 
 
define root view entity YCLC_ASSET_XRATE provider contract transactional_query as projection on YCLI_ASSET_XRATE {

  @UI.facet: [ { id:              'CryptoExchangeRates',
                 purpose:         #STANDARD,
                 type:            #IDENTIFICATION_REFERENCE,
                 label:           'Crypto Exchange Rates',
                 position:        10 } ]

  @UI: {
      lineItem:       [ { position: 10, importance: #HIGH } ],
      identification: [ { position: 10, label: 'Crypto Asset Type' } ] }
  @Search.defaultSearchElement: true
  @Consumption.valueHelpDefinition: [{entity: {name: 'YCLC_ASSET_TYPES', element: 'CryptoAssetType' }}]
    key CryptoAssetType,
    
  @UI: {
      lineItem:       [ { position: 20, importance: #HIGH } ],
      identification: [ { position: 20, label: 'Crypto Rate Type' } ] }
  @Search.defaultSearchElement: true
    key Ratetype,
    
    @UI: {
      lineItem:       [ { position: 30, importance: #HIGH } ],
      identification: [ { position: 30, label: 'Timestamp' } ] }
  @Search.defaultSearchElement: true
  
  @Consumption.filter.selectionType: #RANGE
  @Consumption.filter.mandatory: false
  
    key EffTimestamp,
    
    @UI: {
      lineItem:       [ { position: 40, importance: #HIGH } ],
      identification: [ { position: 40, label: 'Change Rate Quantity' } ] }
    Unitqty,
 
  @UI: {
      lineItem:       [ { position: 50, importance: #HIGH } ],
      identification: [ { position: 50, label: 'Target Currency' } ] }
    @Consumption.valueHelpDefinition: [{entity: {name: 'I_Currency', element: 'Currency' }}]
    Currency,
    
  @UI: {
      lineItem:       [ { position: 60, importance: #HIGH } ],
      identification: [ { position: 60, label: 'Valuation' } ] }
    Value
}
