$(document).ready(function () {
  $("#originZip").on('change',  function(){ validateoriginChange(this); });
  $("#destinationZip").on('change',  function(){ validatedestinationChange(this); });
  $("#originZip").on('blur',  function(){ validateoriginChange(this); });
  $("#destinationZip").on('blur',  function(){ validatedestinationChange(this); });
  
  let orgSearchInput = $("#orgSearch");
  let orgSearchSpinner = $("#orgSearchSpinner");

  orgSearchInput
    .autocomplete({
      source: function (request, response) {
        let input = request.term;
        console.log(input);
        const inputLength = input.length;
        if (inputLength < 3) return;

        orgSearchSpinner.html(
          '<div class="spinner-border spinner-border-sm text-secondary" role="status"></div>'
        );

        $.ajax({
          url: `/api/org/search?name=${input}`,
          type: "GET",
          success: function (results) {
            orgSearchSpinner.html("");
            response(results);
          },
          error: function (error) {
            orgSearchSpinner.html("");
          },
        });
      },
      select: function (event, ui) {
        event.preventDefault();
        $("#orgSearch").val(ui.item.name);
        $("#orgId").val(ui.item.id);
      },
      close: function (event, ui) {},
    })
    .autocomplete("instance")._renderItem = function (ul, item) {
    return $("<li>")
      .append("<div>" + item.name + "</div>")
      .appendTo(ul);
  };

  let personSearchInput = $("#personSearch");
  let personSearchSpinner = $("#personSearchSpinner");

  personSearchInput
    .autocomplete({
      source: function (request, response) {
        let input = request.term;
        console.log(input);
        const inputLength = input.length;
        let orgId = $("#orgId").val();
        if (inputLength < 3) return;

        personSearchSpinner.html(
          '<div class="spinner-border spinner-border-sm text-secondary" role="status"></div>'
        );

        $.ajax({
          url: `/api/person/search?name=${input}&orgId=${orgId}`,
          type: "GET",
          success: function (results) {
            personSearchSpinner.html("");
            response(results);
          },
          error: function (error) {
            personSearchSpinner.html("");
          },
        });
      },
      select: function (event, ui) {
        event.preventDefault();
        $("#personSearch").val(ui.item.name);
        $("#personId").val(ui.item.id);
        $("#personPhone").val(ui.item.phone);
        $("#personEmail").val(ui.item.email);
      },
      close: function (event, ui) {},
    })
    .autocomplete("instance")._renderItem = function (ul, item) {
    return $("<li>")
      .append("<div>" + item.name)
      .appendTo(ul);
  };

  let originZipSearchInput = $("#originZip");
  let orginZipSearchSpinner = $("#orginZipSearchSpinner");
  let originZipSearchInputId = $("#originZipInput");

  originZipSearchInput.autocomplete({
    source: function (request, response) {
      let input = request.term;
      console.log(input);
      const inputLength = input.length;
      if (inputLength < 3) return;
      originZipSearchInputId.val("").change();
      orginZipSearchSpinner.html(
        '<div class="spinner-border spinner-border-sm text-secondary" role="status"></div>'
      );

      $.ajax({
        url: `/api/zipcode/search?zipcode=${input}`,
        type: "GET",
        success: function (results) {
          orginZipSearchSpinner.html("")
          response(results.zips);
        },
        error: function (error) {},
      });
    },
    select: function (event, ui) {
        event.preventDefault();
        originZipSearchInput.removeClass( "is-invalid" );
        originZipSearchInput.addClass( "is-valid" );
        originZipSearchInput.val(ui.item.name);
        originZipSearchInputId.val(ui.item.zip);
    },
    close: function (event, ui) {
      // Hide spinner when the menu is closed
      orginZipSearchSpinner.html("");
    },
    
  }).autocomplete("instance")._renderItem = function (ul, item) {
    return $("<li>")
      .append("<div>" + item.name)
      .appendTo(ul)};

  let destinationZipSearchInput = $("#destinationZip");
  let destinationZipSearchSpinner = $("#destinationZipSearchSpinner");
  let destinationZipSearchInputId = $("#destinationZipInput");

  destinationZipSearchInput.autocomplete({
    source: function (request, response) {
      let input = request.term;
      console.log(input);
      const inputLength = input.length;
      if (inputLength < 3) return;
      destinationZipSearchInputId.val("").change();
      destinationZipSearchSpinner.html(
        '<div class="spinner-border spinner-border-sm text-secondary" role="status"></div>'
      );

      $.ajax({
        url: `/api/zipcode/search?zipcode=${input}`,
        type: "GET",
        success: function (results) {
          destinationZipSearchSpinner.html("")
          response(results.zips);
        },
        error: function (error) {},
      });
    },
    select: function (event, ui) {
        event.preventDefault();
        destinationZipSearchInput.removeClass( "is-invalid" );
        destinationZipSearchInput.addClass( "is-valid" );
        destinationZipSearchInput.val(ui.item.name);
        destinationZipSearchInputId.val(ui.item.zip);
    },
    close: function (event, ui) {
      // Hide spinner when the menu is closed
      destinationZipSearchSpinner.html("");
    },
  }).autocomplete("instance")._renderItem = function (ul, item) {
    return $("<li>")
      .append("<div>" + item.name)
      .appendTo(ul)};
  
  function validateoriginChange() {
    var zip = $("#originZipInput").val();
    if(zip == "" || zip == undefined) {
      originZipSearchInput.removeClass( "is-valid" );
      originZipSearchInput.addClass( "is-invalid" );
    } else {
      originZipSearchInput.removeClass( "is-invalid" );
      originZipSearchInput.addClass( "is-valid" );
    }
  }
  function validatedestinationChange() {
    var zip = $("#destinationZipInput").val();
    if(zip == "" || zip == undefined) {
      destinationZipSearchInput.removeClass( "is-valid" );
      destinationZipSearchInput.addClass( "is-invalid" );
    } else {
      destinationZipSearchInput.removeClass( "is-invalid" );
      destinationZipSearchInput.addClass( "is-valid" );
    }
  }  
});

document.addEventListener("DOMContentLoaded", function () {
  flatpickr("#pickupDate", {
    dateFormat: "m/d/Y",
    enableTime: false,
    static: true, // This prevents the calendar from closing on date selection

    minDate: new Date().fp_incr(-365),
    maxDate: new Date().fp_incr(730),
    onKeyDown: function (ev, inst) {
      // Handle keyboard navigation
      if (ev.key === "Enter") {
        inst.close();
      }
    },
  });

  flatpickr("#deliveryDate", {
    dateFormat: "m/d/Y",
    enableTime: false,
    static: true, // This prevents the calendar from closing on date selection
    minDate: new Date().fp_incr(-365),
    maxDate: new Date().fp_incr(730),
    onKeyDown: function (ev, inst) {
      // Handle keyboard navigation
      if (ev.key === "Enter") {
        inst.close();
      }
    },
  });
});

function submitForm(event) {
  event.preventDefault()

  var myForm = document.getElementById('create-lead')
  var submitButton = document.getElementById('submit-button')
  
  if(!myForm.checkValidity()) {
    event.preventDefault()
    event.stopPropagation()
  } else {
    submitButton.disabled = true
    submitButton.innerHTML = `
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>Submitting...</span>
    `
  }
  
  myForm.classList.add('was-validated')

  myForm.submit()
}