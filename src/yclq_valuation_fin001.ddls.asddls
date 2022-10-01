@AbapCatalog.sqlViewName: 'ZCL_SV_VAL_F001'
--@AbapCatalog.compiler.compareFilter: true
--@AbapCatalog.preserveKey: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLQ_VALUATION_FIN001'

@Analytics.query: true

define view YCLQ_VALUATION_FIN001 
 with parameters
    in_timestamp : timestampl ,
    in_ratetype  : abap.char(8) ,
    to_currency : abap.cuky
 as 
select from YCLVI_VALUATION_FIN 
             ( in_timestamp : $parameters.in_timestamp ,  
               in_ratetype : $parameters.in_ratetype ,
               to_currency : $parameters.to_currency) 

{
    CompanyCode,
    CryptoAssetType,
    CryptoAssetUuid,
    ValCurrency,
    RateType,
    ValTimestamp,
    @AnalyticsDetails.query.axis: #COLUMNS
    QuantityTransacted,
    @Semantics.amount.currencyCode : 'ValCurrency'
    @AnalyticsDetails.query.axis: #COLUMNS
    ValAmount,
    @AnalyticsDetails.query.axis: #COLUMNS
    QuantityFees,
    @AnalyticsDetails.query.axis: #COLUMNS
    ValFees,
    @AnalyticsDetails.query.axis: #COLUMNS
    xUnit,
    @AnalyticsDetails.query.axis: #COLUMNS
    xValue
}
