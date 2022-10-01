@EndUserText.label: 'YCLI_ASSET_TYPES'
@AccessControl.authorizationCheck: #NOT_REQUIRED
define root view entity YCLI_ASSET_TYPES as select from ycl_asset_types {
    key crypto_asset_type as CryptoAssetType,
    crypto_asset_desc as CryptoAssetDesc
}
