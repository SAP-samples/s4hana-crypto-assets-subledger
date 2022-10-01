@EndUserText.label: 'YCLI_TRANS_TYPES'
@AccessControl.authorizationCheck: #NOT_REQUIRED
define root view entity YCLI_TRANS_TYPES as select from ycl_trans_types {
    key transtype as Transtype,
    debitind as Debitind
}
