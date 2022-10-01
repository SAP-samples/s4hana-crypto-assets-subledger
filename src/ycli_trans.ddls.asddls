@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLI_TRANS'
define root view entity YCLI_TRANS as select from ycl_trans
--composition of target_data_source_name as _association_name 

    association [0..1] to YCLI_CRPASSET_ADR   as _CRPASSET_ADR on $projection.CryptoAssetUuid = _CRPASSET_ADR.CryptoAssetUuid
  
    association [0..1] to I_Currency          as _Currency on $projection.Transactioncurrency = _Currency.Currency 
{
    key tran_uuid as TranUuid,
    ctimestamp as Ctimestamp,
    transtype as Transtype,
    crypto_asset_uuid as CryptoAssetUuid,
    quantitytransacted as Quantitytransacted,
    fees as Fees,
    notes as Notes,
    bpartner_addr as BpartnerAddr,
    remote_trans_hash as RemoteTransHash,
    status as Status,
    parent as Parent,
    dispose as Dispose,
    reportable as Reportable,
    transactionamount as Transactionamount,
    transactionfeeamount as Transactionfeeamount,
    transactioncurrency as Transactioncurrency,

       /* associations */
       _CRPASSET_ADR,
       _Currency 

}
