@EndUserText.label: 'YCLC_ASSET_TYPES'
@AccessControl.authorizationCheck: #NOT_REQUIRED


@Metadata.allowExtensions: true
@Search.searchable: true


@UI: {
  headerInfo: { typeName: 'CrytoAssetType',
                typeNamePlural: 'CryptoAssetTypes',
                title: { type: #STANDARD, label: 'Crypto Asset Type', value: 'CryptoAssetType' } },
  presentationVariant: [{ sortOrder: [{ by: 'CryptoAssetType', direction:  #DESC } ] }] }
  
  
  
define root view entity YCLC_ASSET_TYPES provider contract transactional_query as projection on YCLI_ASSET_TYPES {

  @UI.facet: [ { id:              'CryptoAssetType',
                 purpose:         #STANDARD,
                 type:            #IDENTIFICATION_REFERENCE,
                 label:           'Crypto Assets',
                 position:        10 } ]
  @UI: {
      lineItem:       [ { position: 10, importance: #HIGH } ],
      identification: [ { position: 10, label: 'Crypto Asset Type' } ] }
  @Search.defaultSearchElement: true
    key CryptoAssetType,
    
  @UI: {
      lineItem:       [ { position: 20, importance: #HIGH } ],
      identification: [ { position: 20, label: 'Crypto Asset Description' } ] }
  @Search.defaultSearchElement: true
    CryptoAssetDesc    
}
