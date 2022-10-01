@AbapCatalog.sqlViewName: 'ZCL_SV_XRATE'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLVI_XRATE'
define view YCLVI_XRATE 
 with parameters
    in_timestamp : timestampl 
 as 
 select from YCLVI_XRATE_MIN_TS ( in_timestamp : $parameters.in_timestamp ) as xm
 inner join ycl_asset_xrate as x
   on  xm.CryptoAssetType = x.crypto_asset_type
   and xm.Ratetype = x.ratetype
   and xm.Efftimestamp = x.efftimestamp
  {
    key x.crypto_asset_type as CryptoAssetType,
    key x.ratetype  as Ratetype,
    --key min(efftimestamp) as Efftimestamp
    --,
    x.unitqty as Unitqty,
    x.currency as Currency,
    x.value as Value
} 
--where xm.efftimestamp = :in_timestamp

