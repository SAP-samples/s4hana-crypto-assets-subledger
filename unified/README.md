This folder of yaml files supports configuring the project in Unified Services.

Files should be applied using the atomctl command line tool.

Files should be applied in filename order as there are dependencies.

Understand that there are 2 environment for internal SAP stakeholders, Canary and Live  be sure to be logged into the proper environment before running the commands.

Log into Canary : [Workspace Link](https://canary.ingress.atomui.sc.shoot.canary.k8s-hana.ondemand.com/app#/project/_all/organizations/sap/folders?path=%2Fbtp%2Fpes%2Fcrypto-assets-subledger)
```
atomctl login --server-url https://canary.resource.api.sap
atomctl target --base-path /sap/btp/pes/crypto-assets-subledger // Doesn't seem to work anymore must supply -p instead

cd unified
```

The assumption here is that other than policy bindings(permissions) there is no existing folders/resources.
```
atomctl apply -f 01_folder_rates.yaml

atomctl apply -f 02_folder_subledger.yaml
```

Verify the folder structure is as expected
```
atomctl show-tree folder crypto-assets-subledger -p /sap/btp/pes
```

Create Resource Groups
```
atomctl apply -f 03_resource_group_rates.yaml

atomctl apply -f 04_rg_subledger.yaml # Not yet
```

Check to see if any Roles/Bindings exist
Looks like this may be set up enough for a start.  Maybe revisit later.
```
atomctl show-tree folder crypto-assets-subledger -p /sap/btp/pes --types binding
```

https://pages.github.tools.sap/atom-cfs/atom-docs/docs/providing-services/registering-services/unified-provisioning/about-unified-provisioning/spfiapi/


