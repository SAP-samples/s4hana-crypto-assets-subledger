CLASS ycl_gen_table_data DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC .

  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
  PROTECTED SECTION.
  PRIVATE SECTION.
ENDCLASS.



CLASS ycl_gen_table_data IMPLEMENTATION.


  METHOD if_oo_adt_classrun~main.
    DATA:itab TYPE TABLE OF YCL_TRANS.



*   fill internal travel table (itab)
    itab = VALUE #(
        (
        tran_uuid = 'A5EFA03E2BD4432DB6FF93A5A5215048'
        ctimestamp = '20200310111041.2251330'
        transtype = 'BUY'
        asset = 'BTC'
        quantitytransacted = '1'
        fees = '0.01'
        notes = 'First BTC Purchase'
        managed_addr = '0x6feA59921683bd5bb3EFb168fc0D52194B480728'
        bpartner_addr = '0x6feA59921683bd5bb3EFb168fc0D52194B480728'
        remote_trans_hash = '0x0b9494b0384bf96e6f65977bd32eb0e7b850c7c98f039db81e4edf11503f5f0a'
        status = 1
        parent = ''
        dispose = ''
        reportable = 'X'
        )
    ).

*   delete existing entries in the database table
    DELETE FROM YCL_TRANS.

*   insert the new table entries
    INSERT YCL_TRANS FROM TABLE @itab.

*   check the result
    SELECT * FROM YCL_TRANS INTO TABLE @itab.
    out->write( sy-dbcnt ).
    out->write( 'Travel data inserted successfully!').

  ENDMETHOD.

ENDCLASS.
