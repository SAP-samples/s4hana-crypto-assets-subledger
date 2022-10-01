@AbapCatalog.sqlViewName: 'ZCL_SV_VAL_TCUR'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLVI_VALUATION_TCUR'
define view YCLVI_VALUATION_TCUR
 with parameters
    in_timestamp : timestampl ,
    in_ratetype  : abap.char(8) 
 as 
 select from YCLVI_VALUATION_TDEC
             ( in_timestamp : $parameters.in_timestamp ,  
               in_ratetype : $parameters.in_ratetype )  
 
 {
    key CompanyCode,
    key CryptoAssetType,
    key CryptoAssetUuid,
    key ValCurrency,
    RateType,
    ValTimestamp,
    tstmp_to_dats( ValTimestamp,
                     abap_system_timezone( $session.client,'NULL' ),
                     $session.client,
                     'NULL' )      as ValDate,
                     
    QuantityTransacted,
    
    @Semantics.amount.currencyCode : 'YCLVI_VALUATION_TDEC.ValCurrency'
    cast (ValAmount as abap.curr(24, 6)) as ValAmount,
    
    --currency_conversion( amount => ValAmount  ,
    --    source_currency => ValCurrency,
    --    round => 'X',
    --    target_currency => 'USD' , -- :to_currency,
    --    exchange_rate_date => '20221001' , --:exc_date,
    --    error_handling => 'SET_TO_NULL' ) as ValAmount,

    QuantityFees,
    ValFees,
    xUnit,
    xValue
}
