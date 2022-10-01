@AbapCatalog.sqlViewName: 'ZCL_SV_XR_MIN_TS'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLVI_XRATE_MIN_TS '
define view YCLVI_XRATE_MIN_TS 
 with parameters
    in_timestamp : timestampl 
 as
 select from ycl_asset_xrate 
  {
    key crypto_asset_type as CryptoAssetType,
    key ratetype as Ratetype,
    key max(efftimestamp) as Efftimestamp
    --,
    --unitqty as Unitqty,
    --currency as Currency,
    --value as Value
} where efftimestamp <= :in_timestamp
group by crypto_asset_type, ratetype
