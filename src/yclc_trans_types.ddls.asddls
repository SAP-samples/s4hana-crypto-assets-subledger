@EndUserText.label: 'YCLC_TRANS_TYPES'
@AccessControl.authorizationCheck: #NOT_REQUIRED

@Metadata.allowExtensions: true
@Search.searchable: true


@UI: {
  headerInfo: { typeName: 'TransType',
                typeNamePlural: 'TransTypes',
                title: { type: #STANDARD, label: 'Transaction Types', value: 'TransType' } },
  presentationVariant: [{ sortOrder: [{ by: 'Transtype', direction:  #DESC } ] }] }
  
  
define root view entity YCLC_TRANS_TYPES provider contract transactional_query  as projection on YCLI_TRANS_TYPES {
  @UI.facet: [ { id:              'Transtype',
                 purpose:         #STANDARD,
                 type:            #IDENTIFICATION_REFERENCE,
                 label:           'Transaction Type',
                 position:        10 } ]
  @UI: {
      lineItem:       [ { position: 10, importance: #HIGH } ],
      identification: [ { position: 10, label: 'Transaction Type' } ] }
  @Search.defaultSearchElement: true
  

    key Transtype,
    
  @UI: {
      lineItem:       [ { position: 20, importance: #HIGH } ],
      identification: [ { position: 20, label: 'Debit Indicator' } ] }
  @Search.defaultSearchElement: true
    Debitind
}
