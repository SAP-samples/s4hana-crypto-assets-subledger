@EndUserText.label: 'YCLC_CRPASSET_ADR'
@AccessControl.authorizationCheck: #NOT_REQUIRED

 
@UI: {
  headerInfo: { typeName: 'CrytoAsset',
                typeNamePlural: 'CryptoAssets',
                title: { type: #STANDARD, label: 'Timestamp', value: 'CryptoAssetUuid' } },
  presentationVariant: [{ sortOrder: [{ by: 'CryptoAssetType', direction:  #DESC }, { by: 'CryptoAssetUuid', direction:  #DESC } ] }] }
  
 
define root view entity YCLC_CRPASSET_ADR provider contract transactional_query as projection on YCLI_CRPASSET_ADR {
  @UI.facet: [ { id:              'CryptoAssetUuid',
                 purpose:         #STANDARD,
                 type:            #IDENTIFICATION_REFERENCE,
                 label:           'Crypto Assets',
                 position:        20 } ]

 
 
   --Crypto Asset Identifier
  @UI: {
      lineItem:       [ { position: 20, importance: #HIGH } ],
      identification: [ { position: 20, label: 'Crypto Asset ID' } ] }
  @Search.defaultSearchElement: true
  key CryptoAssetUuid,
  
  
  @UI: {
      lineItem:       [ { position: 05, importance: #HIGH } ],
      identification: [ { position: 05, label: 'Company Code' } ] }
  @Consumption.valueHelpDefinition: [{entity: {name: 'I_CompanyCode', element: 'CompanyCode' }}]
  @Consumption.filter.mandatory: true
  --@Consumption.filter.defaultValue : ''
  @Search.defaultSearchElement: true
  CompanyCode,
  
  @UI: {
      lineItem:       [ { position: 10, importance: #HIGH } ],
      identification: [ { position: 10, label: 'Crypto Asset Type' } ] }
  @Search.defaultSearchElement: true
  @Consumption.valueHelpDefinition: [{entity: {name: 'YCLC_ASSET_TYPES', element: 'CryptoAssetType' }}]
  CryptoAssetType,


  -- External Crypto Asset Address
  @UI: {
      lineItem:       [ { position: 30, importance: #HIGH } ],
      identification: [ { position: 30, label: 'External Address' } ] }
  @Search.defaultSearchElement: true
  CryptoAssetAddr,
  
  -- Custodian Wallet
  @UI: {
      lineItem:       [ { position: 40, importance: #HIGH } ],
      identification: [ { position: 40, label: 'Custodian Wallet' } ] }
  @Search.defaultSearchElement: true
  CustodyUuid
                   
}
