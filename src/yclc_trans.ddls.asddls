@EndUserText.label: 'YCLC_TRANS Consumption'
@AccessControl.authorizationCheck: #NOT_REQUIRED

 
@UI: {
  headerInfo: { typeName: 'CrytoTran',
                typeNamePlural: 'CryptoTrans',
                title: { type: #STANDARD, label: 'Timestamp', value: 'Ctimestamp' } },
  presentationVariant: [{ sortOrder: [{ by: 'Ctimestamp', direction:  #DESC }] }] }
  
 
define root view entity YCLC_TRANS provider contract transactional_query as projection on YCLI_TRANS {
  @UI.facet: [ { id:              'CryptoTran',
                 purpose:         #STANDARD,
                 type:            #IDENTIFICATION_REFERENCE,
                 label:           'Crypto Trans',
                 position:        10 } ]

  @UI.identification: [ { position: 02, label: 'TRAN UUID' } ]
  key TranUuid,
  
  @UI: {
      lineItem:       [ { position: 10, importance: #HIGH } ],
      identification: [ { position: 10, label: 'Timestamp' } ] }
  @Search.defaultSearchElement: true
  
  @Consumption.filter.selectionType: #RANGE
  @Consumption.filter.mandatory: true
  Ctimestamp,
  
  --Transaction Type "Buy", "Sell", "Send", "Receive"
  @UI: {
      lineItem:       [ { position: 20, importance: #HIGH } ],
      identification: [ { position: 20, label: 'Transaction Type' } ] }
  @Search.defaultSearchElement: true
  Transtype,
  
  --Crypto Asset Identifier
  @UI: {
      lineItem:       [ { position: 30, importance: #HIGH } ],
      identification: [ { position: 30, label: 'Crypto Asset ID' } ] }
  @Consumption.valueHelpDefinition: [{entity: {name: 'YCLC_CRPASSET_ADR', element: 'CryptoAssetUuid' }}]
  @Search.defaultSearchElement: true
  CryptoAssetUuid,
  
  
  @UI: {
      lineItem:       [ { position: 05, importance: #HIGH } ],
      identification: [ { position: 05, label: 'Company Code' } ] }
  @Consumption.valueHelpDefinition: [{entity: {name: 'I_CompanyCode', element: 'CompanyCode' }}]
  @Consumption.filter.mandatory: true
  @Search.defaultSearchElement: true
  _CRPASSET_ADR.CompanyCode as CompanyCode,
    
    @UI: {
      lineItem:       [ { position: 06, importance: #HIGH } ],
      identification: [ { position: 06, label: 'Crypto Asset Type' } ] }
  @Search.defaultSearchElement: true
  @Consumption.valueHelpDefinition: [{entity: {name: 'YCLC_ASSET_TYPES', element: 'CryptoAssetType' }}]
  _CRPASSET_ADR.CryptoAssetType as CryptoAssetType,
  

  
  --@UI.lineItem: [ { position: 40,  importance: #MEDIUM } ]
  --@UI.identification: [ { position: 40, label: 'Quantity' } ]
  @UI: {
      lineItem:       [ { position: 40, importance: #HIGH } ],
      identification: [ { position: 40, label: 'Quantity' } ] }
  Quantitytransacted,
  
  --Fees( in  crypto)  ??? SEND not Receive O presume
  @UI.lineItem: [ { position: 45,  importance: #MEDIUM } ]
  @UI.identification: [ { position: 45, label: 'Fee Quantity' } ]
  Fees,
  
  @UI.identification: [ { position: 50, label: 'Transaction Currency' } ]
  @Consumption.valueHelpDefinition: [{entity: {name: 'I_Currency', element: 'Currency' }}]
  Transactioncurrency,
  
  @UI.identification: [ { position: 60, label: 'Transaction Amount' } ]
  Transactionamount,
  @UI.identification: [ { position: 65, label: 'Transaction Fee' } ]
  Transactionfeeamount,  


  
  
  --Transaction Notes    ??? Frome Exchange, or manually afterwards... Both? TBC
  @UI: {
      lineItem:       [ { position: 100, importance: #HIGH } ],
      identification: [ { position: 100, label: 'Notes' } ] }
  @Search.defaultSearchElement: true
  Notes,
  
  
  -- Sender receiver Address   .....   link to Business Partners... link to Legal Entity.. link to Accounting treatment
  @UI: {
     -- lineItem:       [ { position: 110, importance: #HIGH } ],
      identification: [ { position: 110, label: 'Business Partner Address' } ] }
  @Search.defaultSearchElement: true
  BpartnerAddr,
  

  
  --BlockChain Hash
  @UI: {
    --  lineItem:       [ { position: 130, importance: #HIGH } ],
      identification: [ { position: 130, label: 'External Transaction Hash' } ] }
  @Search.defaultSearchElement: true
  RemoteTransHash
  
  --,
  
  --@UI.identification: [ { position: 140, label: 'Status' } ]
  --Status
  
  
  --,
  --Association to Transactions  parent_ID
  --@UI.identification: [ { position: 150, label: 'Parent ID' } ]
  --Parent,
  
  --Association to Transactions   dispose_ID
  --@UI.identification: [ { position: 160, label: 'Dispose ID' } ]
  --Dispose,
  
  --False if the transfer was to a wallet I control else it is a true disposition
  -- ... Attribute of Sender receiver Address
  --@UI.identification: [ { position: 170, label: 'Reportable' } ]
  --Reportable


       /* Associations */
      ,
      _CRPASSET_ADR
      
      -- _Currency
       
                   
}
