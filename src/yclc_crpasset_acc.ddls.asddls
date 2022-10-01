@EndUserText.label: 'YCLC_CRPASSET_ACC'
@AccessControl.authorizationCheck: #NOT_REQUIRED

 
@UI: {
  headerInfo: { typeName: 'Cryto Account',
                typeNamePlural: 'Crypto Accounts',
                title: { type: #STANDARD, label: 'Companycode', value: 'Companycode' } },
  presentationVariant: [{ sortOrder: [{ by: 'Companycode', direction:  #DESC },{ by: 'Sourceledger', direction:  #DESC },{ by: 'CryptoAssetType', direction:  #DESC }] }] }
  
 
define root view entity YCLC_CRPASSET_ACC provider contract transactional_query as projection on YCLI_CRPASSET_ACC {

  @UI.facet: [ { id:              'CryptoAccounts',
                 purpose:         #STANDARD,
                 type:            #IDENTIFICATION_REFERENCE,
                 label:           'Crypto Accounts',
                 position:        10 } ]


    @Consumption.valueHelpDefinition: [{entity: {name: 'I_CompanyCode', element: 'CompanyCode' }}]
    @UI: {
      lineItem:       [ { position: 10, importance: #HIGH } ],
      identification: [ { position: 10, label: 'Company Code' } ] }
    @Search.defaultSearchElement: true
    --@Consumption.filter.mandatory : true
    key Companycode,
    
    @Consumption.valueHelpDefinition: [{entity: {name: 'I_Ledger', element: 'Ledger' }}]
  @UI: {
      lineItem:       [ { position: 20, importance: #HIGH } ],
      identification: [ { position: 20, label: 'Source Ledger' } ] }
  @Search.defaultSearchElement: true
    key Sourceledger,
    
  @UI: {
      lineItem:       [ { position: 30, importance: #HIGH } ],
      identification: [ { position: 30, label: 'Crypto Asset Type' } ] }
  @Search.defaultSearchElement: true
    key CryptoAssetType,
    
    

   @UI: {
      lineItem:       [ { position: 40, importance: #HIGH } ],
      identification: [ { position: 40, label: 'Crypto AssetTreatment' } ] }
  @Search.defaultSearchElement: true
    CryptoAssetTreatment,
    
    --association [0..1] to I_GLAccountInCompanyCode       as _GLAccountInCompanyCode        on  $projection.CompanyCode = _GLAccountInCompanyCode.CompanyCode
    --                                                                                     and $projection.GLAccount   = _GLAccountInCompanyCode.GLAccount
 
 
    --NOT WORKING YET
    @Consumption.valueHelpDefinition: [{entity: {name: 'I_GLAccountInCompanyCodeStdVH', element: 'GLAccount' }, 
                                                 additionalBinding  : [{ localElement   : 'CompanyCode',
                                                                         element        : 'CompanyCode'
                                                                      }] 
                                      }]
    @UI.identification: [ { position: 50, label: 'Asset Account' } ]
    CryptAccntAsset,
    @Consumption.valueHelpDefinition: [{entity: {name: 'I_GLAccountInCompanyCodeStdVH', element: 'GLAccount' }}]
    @UI.identification: [ { position: 60, label: 'Fee Account' } ]
    CryptAccntFee,
    @UI.identification: [ { position: 70, label: 'Interest Account' } ]
    CryptAccntInt,
    @UI.identification: [ { position: 80, label: 'Gain/Loss Account - Realised' } ]
    CryptAccntGlReal,
    @UI.identification: [ { position: 90, label: 'Gain/Loss Account - UnRealised' } ]
    CryptAccntGlUnreal,
     @UI.identification: [ { position: 100, label: 'Crypto Rate Type' } ]
    CryptRatetype,
    
    @Consumption.valueHelpDefinition: [{entity: {name: 'I_ControllingArea', element: 'ControllingArea' }}]
    @UI.identification: [ { position: 110, label: 'Controlling Area' } ]
    ControllingArea,
    
    @Consumption.valueHelpDefinition: [{entity: {name: 'I_CostCenter', element: 'CostCenter' }}]
    @UI.identification: [ { position: 120, label: 'Cost Center' } ]
    Costcenter,
    
    @Consumption.valueHelpDefinition: [{entity: {name: 'I_ProfitCenter', element: 'ProfitCenter' }}]
    @UI.identification: [ { position: 130, label: 'Profit Center' } ]
    Profitcenter,
    @UI.identification: [ { position: 140, label: 'Business Area' } ]
    Businessarea,
    /* Associations */
    _BusinessArea,
    _CompanyCode,
    _ControllingArea,
    _CostCenter,
    _GLAccountInCompanyCodeA,
    _Ledger,
    _ProfitCenter
}
