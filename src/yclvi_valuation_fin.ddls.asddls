@AbapCatalog.sqlViewName: 'ZCL_SV_VAL_FIN'
@AbapCatalog.compiler.compareFilter: true
@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: '${ddl_source_description}' --'YCLVI_VALUATION_TCUR'

@Analytics.dataCategory: #CUBE --#Dimension
@Analytics.internalName: #LOCAL

--@ObjectModel.representativeKey: 'CryptoAssetUuid'

define view YCLVI_VALUATION_FIN
 with parameters
    in_timestamp : timestampl ,
    in_ratetype  : abap.char(8) ,
    to_currency : abap.cuky
 as 
 select from YCLVI_VALUATION_TCUR
             ( in_timestamp : $parameters.in_timestamp ,  
               in_ratetype : $parameters.in_ratetype )  
 
 {
    @ObjectModel.text.element: ['Name']
    key CompanyCode,
    key CryptoAssetType,
    key CryptoAssetUuid,
    key :to_currency as ValCurrency,
    RateType,
    ValTimestamp,
    QuantityTransacted,
    
    @Semantics.amount.currencyCode : ':to_currency'
    
    currency_conversion( amount => ValAmount  ,
        source_currency => ValCurrency,
        round => 'X',
        target_currency =>  :to_currency,
        exchange_rate_date => ValDate , 
        error_handling => 'SET_TO_NULL' ) as ValAmount,

    QuantityFees,
    
    --currency_conversion( amount => ValFees  ,
    --    source_currency => ValCurrency,
    --    round => 'X',
    --    target_currency =>  :to_currency,
    --    exchange_rate_date => ValDate , 
    --    error_handling => 'SET_TO_NULL' ) as ValFees,
    ValFees,
        
    xUnit,
    xValue
}
