/*
 * This program was produced for the U.S. Agency for International Development. It was prepared by the USAID | DELIVER PROJECT, Task Order 4. It is part of a project which utilizes code originally licensed under the terms of the Mozilla Public License (MPL) v2 and therefore is licensed under MPL v2 or later.
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the Mozilla Public License as published by the Mozilla Foundation, either version 2 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the Mozilla Public License for more details.
 *
 * You should have received a copy of the Mozilla Public License along with this program. If not, see http://www.mozilla.org/MPL/
 */

function StockAdjustmentController($scope, $timeout,$location,$routeParams,StockCardsByCategory,SaveVaccineInventoryAdjustment,localStorageService,homeFacility,adjustmentTypes,UserFacilityList) {

    //Get Home Facility
    $scope.currentStockLot = undefined;
    $scope.adjustmentReasonsDialogModal = false;
    $scope.homeFacility = homeFacility;
    $scope.adjustmentTypes=adjustmentTypes;
    $scope.adjustmentReason={};
    var AdjustmentReasons=[];

    StockCardsByCategory.get(82,19074).then(function(data){
        $scope.stockCardsToDisplay=data;
    });

//    LoggedInUserDetails.get({}, function (data) {
//            $scope.loggedInUser= data.userDetails;
//        });

    $scope.date = new Date();
    $scope.apply=function(){
        $scope.$apply();
    };

    $scope.showAdjustmentReason=function(lot)
    {

       $scope.oldAdjustmentReason = angular.copy(lot.AdjustmentReasons);
       $scope.currentStockLot = lot;
       $scope.currentStockLot.adjustmentReasons=((lot.adjustmentReasons === undefined)?[]:lot.adjustmentReasons);
       //Remove reason already exist from drop down
       reEvaluateTotalAdjustmentReasons();
       updateAdjustmentReasonForLot(lot.adjustmentReasons);
       $scope.adjustmentReasonsDialogModal = true;

    };
    $scope.removeAdjustmentReason=function(reasonToDelete)
    {
        $scope.currentStockLot.adjustmentReasons = $.grep($scope.currentStockLot.adjustmentReasons, function (reasonObj) {
              return !(reasonToDelete === reasonObj);
            });
        updateAdjustmentReasonForLot($scope.currentStockLot.adjustmentReasons);
        reEvaluateTotalAdjustmentReasons();
    };

    $scope.closeModal=function(){
        $scope.currentStockLot.adjustmentReasons = $scope.oldAdjustmentReason;
        reEvaluateTotalAdjustmentReasons();
        $scope.adjustmentReasonsDialogModal=false;
    };
    //Save Adjustment
     $scope.saveAdjustmentReasons = function () {
        $scope.modalError = '';
        $scope.clearAndCloseAdjustmentModal();
      };
     $scope.clearAndCloseAdjustmentModal = function () {
         reEvaluateTotalAdjustmentReasons();
         $scope.adjustmentReason = undefined;
         $scope.adjustmentReasonsDialogModal=false;

       };

     $scope.addAdjustmentReason=function(newAdjustmentReason)
     {
         var adjustmentReason={};
         adjustmentReason.type = newAdjustmentReason.type;
         adjustmentReason.name = newAdjustmentReason.type.name;
         adjustmentReason.quantity= newAdjustmentReason.quantity;

         $scope.currentStockLot.adjustmentReasons.push(adjustmentReason);
         updateAdjustmentReasonForLot($scope.currentStockLot.AdjustmentReasons);
         reEvaluateTotalAdjustmentReasons();
         newAdjustmentReason.type = undefined;
         newAdjustmentReason.quantity = undefined;

     };
     $scope.updateStock=function(){
            var transaction={};
            transaction.transactionList=[];

            $scope.stockCardsToDisplay.forEach(function(st){
                st.stockCards.forEach(function(s){
                     var list={};
                     list.productId=s.product.id;
                     list.lots=[];
                    s.lotsOnHand.forEach(function(l){
                        var lot={};
                        lot.lotId=l.lot.id;
                        lot.quantity=l.quantity;
                        lot.adjustmentReasons=l.adjustmentReasons;
                        list.lots.push(lot);
                    });
                   transaction.transactionList.push(list);
                });

            });
            SaveVaccineInventoryAdjustment.update(transaction,function(data)
            {
               if(data.success !==null)
               {
                     $scope.message=data.success;
                     $timeout(function(){
                         $location.path('/stock-on-hand');
                     },1200)
               }

            });

     };
     $scope.cancel=function(){
        $location.path('/stock-on-hand');
     }


      function reEvaluateTotalAdjustmentReasons()
      {
             var totalAdjustments = 0;
             $($scope.currentStockLot.adjustmentReasons).each(function (index, adjustmentObject) {
               if(adjustmentObject.type.additive)
               {
                    totalAdjustments = totalAdjustments + parseInt(adjustmentObject.quantity);
               }else{
                    totalAdjustments = totalAdjustments - parseInt(adjustmentObject.quantity);
               }

             });
             $scope.currentStockLot.totalAdjustments=totalAdjustments;
      }
      $scope.reEvaluateTotalAdjustmentReasons= function() {reEvaluateTotalAdjustmentReasons();};

     function updateAdjustmentReasonForLot(adjustmentReasons)
     {
        // console.log(JSON.stringify(adjustmentReasons));
         var adjustmentReasonsForLot = _.pluck(_.pluck(adjustmentReasons, 'type'), 'name');
       //  console.log(adjustmentReasonsForLot);
         $scope.adjustmentReasonsToDisplay = $.grep($scope.adjustmentTypes, function (adjustmentTypeObject) {
              return $.inArray(adjustmentTypeObject.name, adjustmentReasonsForLot) == -1;
          });
     }

     //Load Right to check if user level can Send Requisition ond do stock adjustment
          $scope.loadRights = function () {
                 $scope.rights = localStorageService.get(localStorageKeys.RIGHT);
               }();

          $scope.hasPermission = function (permission) {
                 if ($scope.rights !== undefined && $scope.rights !== null) {
                   var rights = JSON.parse($scope.rights);
                   var rightNames = _.pluck(rights, 'name');
                   return rightNames.indexOf(permission) > -1;
                 }
                 return false;
           };

}
StockAdjustmentController.resolve = {

        homeFacility: function ($q, $timeout,UserFacilityList) {
            var deferred = $q.defer();
            var homeFacility={};

            $timeout(function () {
                   //Home Facility
                   UserFacilityList.get({}, function (data) {
                           homeFacility = data.facilityList[0];
                           deferred.resolve(homeFacility);
                   });

            }, 100);
            return deferred.promise;
         },
         adjustmentTypes: function ($q, $timeout,VaccineAdjustmentReasons ) {
                     var deferred = $q.defer();

                     $timeout(function () {
                              //Load Adjustment reasons
                              VaccineAdjustmentReasons.get({},function(data){
                                     deferred.resolve(data.adjustmentReasons);
                              });
                     }, 100);
                     return deferred.promise;
        },
        programs:function ($q, $timeout, VaccineInventoryPrograms) {
                    var deferred = $q.defer();
                    var programs={};

                    $timeout(function () {
                             VaccineInventoryPrograms.get({},function(data){
                               programs=data.programs;
                                deferred.resolve(programs);
                             });
                    }, 100);
                    return deferred.promise;
        }


}