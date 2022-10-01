@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLI_CRPASSET_ADR'
define root view entity YCLI_CRPASSET_ADR as select from ycl_crpasset_adr
--composition of target_data_source_name as _association_name 
{
    key crypto_asset_uuid   as CryptoAssetUuid,
    companycode             as CompanyCode,
    crypto_asset_type       as CryptoAssetType,
    crypto_asset_addr       as CryptoAssetAddr,
    custody_uuid            as CustodyUuid
  
}
