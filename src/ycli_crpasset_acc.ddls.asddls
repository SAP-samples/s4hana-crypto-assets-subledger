@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'YCLI_CRPASSET_ACC'
define root view entity YCLI_CRPASSET_ACC as select from ycl_crpasset_acc
--composition of target_data_source_name as _association_name 

association [1..1] to I_CompanyCode                  as _CompanyCode                   on  $projection.Companycode = _CompanyCode.CompanyCode

association [1..1] to I_Ledger                       as _Ledger                        on  $projection.Sourceledger = _Ledger.Ledger

association [0..1] to I_ControllingArea              as _ControllingArea               on  $projection.ControllingArea = _ControllingArea.ControllingArea

association [0..*] to I_ProfitCenter                 as _ProfitCenter                  on  $projection.ControllingArea = _ProfitCenter.ControllingArea
                                                                                       and $projection.Profitcenter    = _ProfitCenter.ProfitCenter
association [0..*] to I_CostCenter                   as _CostCenter                    on  $projection.ControllingArea = _CostCenter.ControllingArea
                                                                                       and $projection.Costcenter      = _CostCenter.CostCenter
association [0..1] to I_BusinessArea                 as _BusinessArea                  on  $projection.Businessarea = _BusinessArea.BusinessArea

association [0..1] to I_GLAccountInCompanyCodeStdVH       as _GLAccountInCompanyCodeA        on  $projection.Companycode      = _GLAccountInCompanyCodeA.CompanyCode
                                                                                             and $projection.CryptAccntAsset   = _GLAccountInCompanyCodeA.GLAccount

association [0..1] to I_GLAccountInCompanyCodeStdVH       as _GLAccountInCompanyCodeF        on  $projection.Companycode      = _GLAccountInCompanyCodeF.CompanyCode
                                                                                             and $projection.CryptAccntFee   = _GLAccountInCompanyCodeF.GLAccount

{
    key companycode as Companycode,
    key sourceledger as Sourceledger,
    key crypto_asset_type as CryptoAssetType,
    crypto_asset_treatment as CryptoAssetTreatment,
    crypt_accnt_asset as CryptAccntAsset,
    crypt_accnt_fee as CryptAccntFee,
    crypt_accnt_int as CryptAccntInt,
    crypt_accnt_gl_real as CryptAccntGlReal,
    crypt_accnt_gl_unreal as CryptAccntGlUnreal,
    crypt_ratetype as CryptRatetype,
    controllingarea as ControllingArea,
    costcenter as Costcenter,
    profitcenter as Profitcenter,
    businessarea as Businessarea
--    _association_name // Make association public

    /* associations */
    ,
    _CompanyCode ,
    _Ledger,
    _ControllingArea,
    _ProfitCenter,
    _CostCenter,
    _BusinessArea,
    _GLAccountInCompanyCodeA,
    _GLAccountInCompanyCodeF
}
