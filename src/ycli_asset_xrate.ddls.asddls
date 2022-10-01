@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLI_ASSET_XRATE'
define root view entity YCLI_ASSET_XRATE as select from ycl_asset_xrate
--composition of target_data_source_name as _association_name 
{
    key crypto_asset_type as CryptoAssetType,
    key ratetype as Ratetype,
    key efftimestamp as EffTimestamp,
    unitqty as Unitqty,
    currency as Currency,
    value as Value
    --,
    --_association_name // Make association public
}
