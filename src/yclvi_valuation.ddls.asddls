@AbapCatalog.sqlViewName: 'ZCL_SV_VALUATION'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLVI_VALUATION'
define view YCLVI_VALUATION 
 with parameters
    in_timestamp : timestampl ,
    in_ratetype  : abap.char(8) 
 as 

select from YCLI_TRANS as t  
--inner join YCLI_CRPASSET_ADR as a
--    on  a.CryptoAssetUuid = t.CryptoAssetUuid
left outer join YCLVI_XRATE ( in_timestamp : $parameters.in_timestamp ) as xr

   --- better fix needed.. not likely optimised for performance
    --on   (  xr.CryptoAssetType = t._CRPASSET_ADR.CryptoAssetType --'BTC' -- a.CryptoAssetType  =
    --and xr.Ratetype = :in_ratetype )
    on xr.Ratetype = :in_ratetype
    
{

    key t._CRPASSET_ADR.CompanyCode as CompanyCode,
    key t._CRPASSET_ADR.CryptoAssetType as CryptoAssetType,
    --key a.CryptoAssetType        as CryptoAssetType,
    --key a.CompanyCode            as CompanyCode,
    key t.CryptoAssetUuid       as CryptoAssetUuid,
    key xr.Currency               as ValCurrency,
    $parameters.in_ratetype      as RateType ,
    $parameters.in_timestamp     as ValTimestamp ,
    sum(t.Quantitytransacted)      as QuantityTransacted,
    
    -- needs floating point
    --cast(           as abap.curr( 18, 2 ) )
    --can't convert
    --fltp_to_dec(    as abap.dec(24,2) )
    
    -- only literal columns allowed
    --fltp_to_dec(cast(1.333333 as abap.fltp) / 4.12345  as abap.dec(24,2) ) as atest,
    
    -- only literal columns allowed
    --fltp_to_dec( cast(sum(t.Quantitytransacted) as abap.fltp)  / cast(max(xr.Unitqty) as abap.fltp) * cast(max(xr.Value)  as abap.fltp ) as abap.dec(24,2) ) as ValAmount0,
    
    cast(sum(t.Quantitytransacted) as abap.fltp)  / cast(max(xr.Unitqty) as abap.fltp) * cast(max(xr.Value)  as abap.fltp ) as ValAmount,
    
    --only column paths and parameters can be passed
    --currency_conversion( amount => ( cast(sum(t.Quantitytransacted) as abap.fltp)  / cast(max(xr.Unitqty) as abap.fltp) * cast(max(xr.Value)  as abap.fltp ) ) ,
    --    source_currency => xr.Currency,
    --    round => 'X',
    --    target_currency => 'USD' , -- :to_currency,
    --    exchange_rate_date => '20221001' , --:exc_date,
    --    error_handling => 'SET_TO_NULL' ) as ValAmount2,
    
                                 
    sum(t.Fees)                    as QuantityFees,
    
    
     -- needs floating point
    cast(sum(t.Fees) as abap.fltp)  / cast(max(xr.Unitqty) as abap.fltp) * cast(max(xr.Value)  as abap.fltp)    
                                 as ValFees,
    max(xr.Unitqty)               as xUnit,
    max(xr.Value)                 as xValue
}  where t.Ctimestamp <= :in_timestamp
   --- better fix needed.. not likely optimised for performance
   and xr.CryptoAssetType = t._CRPASSET_ADR.CryptoAssetType
   
group by 
t._CRPASSET_ADR.CompanyCode,
t._CRPASSET_ADR.CryptoAssetType,
t.CryptoAssetUuid,
--a.CryptoAssetType, 
--a.CompanyCode , 
xr.Currency 
