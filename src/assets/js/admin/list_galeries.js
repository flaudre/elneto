var app = require('./globals');

app.then(function(){
  console.log("Loaded globals.");

  /*

  var getSelectedGaleries = function(){
    var selectedGaleries = [];
    $('.galery-listing').each(function(){
      var id = $(this).get(0).id;
      var checkbox = $(this).find('.checkbox').first();

      if(checkbox.hasClass("checked")){
        selectedGaleries.push(String(id));
      }
    });

    return selectedGaleries;
  }

  // Delete selected galeries
  $('#deleteSelected').click(function(){
    var confirmDelete = $('#deleteModalTemplate').clone().html($('#deleteModalTemplate').html().replace(/###placeholder###/g, "all selected galeries"));

    confirmDelete.modal({
      onApprove : function() {
        var galeries = getSelectedGaleries();

        galeries.forEach(function(galery_id){

          var id = galery_id;

          if(id.substring(0,7) == "galery_"){
            id = id.substring(7, id.length);
          }

          console.log("Deleting galery " + id);

          id = parseInt(id);
          $.ajax({
            method: 'POST',
            url: '/admin/galery/delete',
            data: { id: id },
            success : function(result){
              console.log(result.message);

              if(result.success){
                $('#galery_' + id).hide();
              }
            },
            error : function(xhr){
              console.log(xhr.status + " " + xhr.statusText);
            }
          })


        });
      }
    })
    .modal('show');

  });
  */


  var resetButtonsState = function () {
    $(".changeOrderUp").removeClass("disabled");
    $(".changeOrderDown").removeClass("disabled");
    $(".changeOrderUp:first").addClass("disabled");
    $(".changeOrderDown:last").addClass("disabled");
  };
  resetButtonsState();

  // Delete galery
  $(".deleteGalery").click(function(){
    var id = $(this).data("id");
    console.log("Deleting: " + id);

    deleteGalery(id);
  });

  var deleteGalery = function(id){
    var confirmDelete = $('#deleteModalTemplate').clone().html($('#deleteModalTemplate').html().replace(/###placeholder###/g, "this galery"));

    confirmDelete.modal({
      onApprove : function() {
        $.ajax({
          method: 'POST',
          url: '/admin/galery/delete',
          data: { id: id },
          success : function(result){
            console.log(result.message);

            if(result.success){
              $('#galery_' + id).remove();
              resetButtonsState();
            }
          },
          error : function(xhr){
            console.log(xhr.status + " " + xhr.statusText);
          }
        })
      }
    })
      .modal('show');
  };

  $('.ui.checkbox').checkbox();

  var sort = function (id, direction) {

    $.ajax({
      method: 'POST',
      url: '/admin/galery/change-order/' + id,
      data: { direction },
      success: function (result) {
        window.location.href = "/admin/galery/";
      },
      error: function (xhr) {
        console.log(xhr.status + " " + xhr.statusText);
      }
    })

  };

  $(".changeOrderUp").click(function () {
    var id = $(this).data("id");
    sort(id, 'up')
  });

  $(".changeOrderDown").click(function () {
    var id = $(this).data("id");
    sort(id, 'down')
  })

});

