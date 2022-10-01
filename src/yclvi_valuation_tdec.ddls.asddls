@AbapCatalog.sqlViewName: 'ZCL_SV_VAL_TDEC'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLVI_VALUATION_TDEC'
define view YCLVI_VALUATION_TDEC
 with parameters
    in_timestamp : timestampl ,
    in_ratetype  : abap.char(8) 
 as 
 select from YCLVI_VALUATION 
             ( in_timestamp : $parameters.in_timestamp ,  
               in_ratetype : $parameters.in_ratetype )  
 
 {
    key CompanyCode,
    key CryptoAssetType,
    key CryptoAssetUuid,
    key ValCurrency,
    RateType,
    ValTimestamp,
    QuantityTransacted,
    
    --ValAmount,
    fltp_to_dec( ValAmount as abap.dec(24,2) ) as ValAmount,
    
    -- ## incorrect FLTP expects CURR D34N
    --currency_conversion( amount => ValAmount  ,
    --    source_currency => ValCurrency,
    --    round => 'X',
    --    target_currency => 'USD' , -- :to_currency,
    --    exchange_rate_date => '20221001' , --:exc_date,
    --    error_handling => 'SET_TO_NULL' ) as ValAmount,
         
    --unit_conversion( quantity => ValAmount,     --dec3
    --    source_unit => cast( 'MI' as abap.unit(3) ),
    --    target_unit => 'DEC',     --:to_unit
    --    error_handling => 'SET_TO_NULL' ) as ValAmount,  

    QuantityFees,
    ValFees,
    xUnit,
    xValue
}
