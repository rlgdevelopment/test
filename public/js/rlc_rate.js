function submitForm(event) {
  event.preventDefault();

  var myForm = document.getElementById("rlc-rate");
  var submitButton = document.getElementById("submit-button");

  if (!myForm.checkValidity()) {
    event.preventDefault();
    event.stopPropagation();
  } else {
    submitButton.disabled = true;
    submitButton.innerHTML = `
      <span class="spinner-border spinner-border-sm" aria-hidden="true"></span>
      <span>Submitting...</span>
    `;
  }

  myForm.classList.add("was-validated");

  myForm.submit();
}

$(document).ready(function () {
  $("#originZip").on("change", function () {
    validateoriginChange(this);
  });
  $("#destinationZip").on("change", function () {
    validatedestinationChange(this);
  });
  $("#originZip").on("blur", function () {
    validateoriginChange(this);
  });
  $("#destinationZip").on("blur", function () {
    validatedestinationChange(this);
  });

  let originZipSearchInput = $("#originZip");
  let orginZipSearchSpinner = $("#orginZipSearchSpinner");
  let originZipSearchInputId = $("#originZipInput");
  let originCity = $("#originCity");
  let originState = $("#originState");
  let originZipCode = $("#originZipCode");

  originZipSearchInput
    .autocomplete({
      source: function (request, response) {
        let input = request.term;
        console.log(input);
        const inputLength = input.length;
        if (inputLength < 3) return;
        originZipSearchInputId.val("").change();
        orginZipSearchSpinner.html(
          '<span class="spinner-border spinner-border-sm text-secondary" role="status"></span>'
        );

        $.ajax({
          url: `/api/zipcode/search?zipcode=${input}`,
          type: "GET",
          success: function (results) {
            orginZipSearchSpinner.html("");
            response(results.zips);
          },
          error: function (error) {},
        });
      },
      select: function (event, ui) {
        event.preventDefault();
        originZipSearchInput.removeClass("is-invalid");
        originZipSearchInput.addClass("is-valid");
        originZipSearchInput.val(ui.item.name);
        originZipSearchInputId.val(ui.item.zip);
        originCity.val(ui.item.city);
        originState.val(ui.item.state);
        originZipCode.val(ui.item.zip);
      },
      close: function (event, ui) {
        orginZipSearchSpinner.html("");
      },
    })
    .autocomplete("instance")._renderItem = function (ul, item) {
    return $("<li>")
      .append("<div>" + item.name)
      .appendTo(ul);
  };

  let destinationZipSearchInput = $("#destinationZip");
  let destinationZipSearchSpinner = $("#destinationZipSearchSpinner");
  let destinationZipSearchInputId = $("#destinationZipInput");
  let destinationCity = $("#destinationCity");
  let destinationState = $("#destinationState");
  let destinationZipCode = $("#destinationZipCode");

  destinationZipSearchInput
    .autocomplete({
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
            destinationZipSearchSpinner.html("");
            response(results.zips);
          },
          error: function (error) {},
        });
      },
      select: function (event, ui) {
        event.preventDefault();
        destinationZipSearchInput.removeClass("is-invalid");
        destinationZipSearchInput.addClass("is-valid");
        destinationZipSearchInput.val(ui.item.name);
        destinationZipSearchInputId.val(ui.item.zip);
        destinationCity.val(ui.item.city);
        destinationState.val(ui.item.state);
        destinationZipCode.val(ui.item.zip);
      },
      close: function (event, ui) {
        destinationZipSearchSpinner.html("");
      },
    })
    .autocomplete("instance")._renderItem = function (ul, item) {
    return $("<li>")
      .append("<div>" + item.name)
      .appendTo(ul);
  };

  function validateoriginChange() {
    var zip = $("#originZipInput").val();
    if (zip == "" || zip == undefined) {
      originZipSearchInput.removeClass("is-valid");
      originZipSearchInput.addClass("is-invalid");
    } else {
      originZipSearchInput.removeClass("is-invalid");
      originZipSearchInput.addClass("is-valid");
    }
  }
  function validatedestinationChange() {
    var zip = $("#destinationZipInput").val();
    if (zip == "" || zip == undefined) {
      destinationZipSearchInput.removeClass("is-valid");
      destinationZipSearchInput.addClass("is-invalid");
    } else {
      destinationZipSearchInput.removeClass("is-invalid");
      destinationZipSearchInput.addClass("is-valid");
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
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("rlc-rate");
  const formRows = document.getElementById("itemRows");
  const addItem = document.getElementById("addItem");

  let rowCount = 1;
  const maxRows = 8;

  addItem.addEventListener("click", function () {
    if (rowCount < maxRows) {
      const newRow = `
        <div class="row mt-2 itemRow">
          <div class="col-md-3">
            <label class="form-label" for="items[${rowCount}][class]">Class<span class="required">*</span></label>
            <select class="form-select form-select-md" aria-label="small select example" name="items[${rowCount}][class]" required>
              <option selected disabled value="">select</option>
              <option value="50.0">50.0</option>
              <option value="55.0">55.0</option>
              <option value="60.0">60.0</option>
              <option value="65.0">65.0</option>
              <option value="70.0">70.0</option>
              <option value="77.5">77.5</option>
              <option value="85.0">85.0</option>
              <option value="92.5">92.5</option>
              <option value="100.0">100.0</option>
              <option value="110.0">110.0</option>
              <option value="125.0">125.0</option>
              <option value="150.0">150.0</option>
              <option value="175.0">175.0</option>
              <option value="200.0">200.0</option>
              <option value="250.0">250.0</option>
              <option value="300.0">300.0</option>
              <option value="400.0">400.0</option>
              <option value="500.0">500.0</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="items[${rowCount}][weight]">Weight (lb)<span class="required">*</span></label>
            <input type="number" class="form-control" placeholder="0" name="items[${rowCount}][weight]" min="1" max="19999" required>
          </div>
          <div class="col-md-3 form-check">
            <div>&nbsp;</div>
            <label class="form-check-label" for="items[${rowCount}][dimensions]">Dimensions</label>
            <input type="checkbox" class="form-check-input dimensionsCheckbox" name="items[${rowCount}][dimensions]" data-row="${rowCount}">
          </div>
          <div class="col-md-3">
            <div>&nbsp;</div>
            <button type="button" class="btn btn-danger removeRowBtn">Remove</button>
          </div>
        </div>
      `;
      formRows.insertAdjacentHTML("beforeend", newRow);
      rowCount++;
    } else {
      alert("Maximum limit reached (8 rows).");
    }
  });

  formRows.addEventListener("click", function (event) {
    if (event.target.classList.contains("removeRowBtn")) {
      const row = event.target.closest(".itemRow");
      row.remove();
      rowCount--;
    }
  });

  const dimensionsCheckbox = document.getElementById("dimensionsCheckbox");

  // const itemRow = document.getElementById('itemRow');
  formRows.addEventListener("change", function (event) {
    const itemRow = event.target.closest(".row");
    if (
      event.target.classList.contains("dimensionsCheckbox") &&
      event.target.checked
    ) {
      let dimensionRowCount = event.target.getAttribute("data-row");
      const newRow = document.createElement("div");
      newRow.classList.add("row", "mb-3", "dimensionRow");
      newRow.innerHTML = `
        <div class="row mt-2">
          <div class="col-md-3">
            <label class="form-label" for="items[${dimensionRowCount}][units]" >Handling Units</label>
            <input type="number" class="form-control" name="items[${dimensionRowCount}][units]" value="1" required>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="items[${dimensionRowCount}][length]">Length (in)</label>
            <input type="number" class="form-control" name="items[${dimensionRowCount}][length]" placeholder="0" required>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="items[${dimensionRowCount}][width]">Width (in)</label>
            <input type="number" class="form-control" name="items[${dimensionRowCount}][width]" placeholder="0" required>
          </div>
          <div class="col-md-3">
            <label class="form-label" for="items[${dimensionRowCount}][height]">Height (in)</label>
            <input type="number" class="form-control" name="items[${dimensionRowCount}][height]" placeholder="0" required>
          </div>
        </div>
      `;
      itemRow.appendChild(newRow);
    } else if (
      event.target.classList.contains("dimensionsCheckbox") &&
      !event.target.checked
    ) {
      // If unchecked, remove the last added row
      const lastRow = itemRow.lastElementChild;
      if (lastRow !== null) {
        lastRow.remove();
      }
    }
  });

  // const overDimensionCheckBox = document.getElementById('OverDimension')
  // overDimensionCheckBox.addEventListener('change', function(event) {
  //   const accessorials = document.getElementById('accessorials')
  //   const overDimensionContainer = document.getElementById('overDimensionContainer')
  //   if(event.target.checked) {
  //     const newRow = document.createElement('div')
  //     newRow.classList.add('mt-2', 'bg-custom', 'text-dark', 'rounded', 'p-3');
  //     newRow.id = "overDimensionContainer"
  //     newRow.innerHTML = `
  //       <div class="row">
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[0][pieces]">Pieces</label>
  //           <input type="number" class="form-control" name="overDimension[0][pieces]" placeholder="0">
  //         </div>
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[0][length]">Length (in)</label>
  //           <input type="number" class="form-control" name="overDimension[0][length]" placeholder="0">
  //         </div>
  //       </div>
  //       <div class="row">
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[1][pieces]">Pieces</label>
  //           <input type="number" class="form-control" name="overDimension[1][pieces]" placeholder="0">
  //         </div>
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[1][length]">Length (in)</label>
  //           <input type="number" class="form-control" name="overDimension[1][length]" placeholder="0">
  //         </div>
  //       </div>
  //       <div class="row">
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[2][pieces]">Pieces</label>
  //           <input type="number" class="form-control" name="overDimension[2][pieces]" placeholder="0">
  //         </div>
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[2][length]">Length (in)</label>
  //           <input type="number" class="form-control" name="overDimension[2][length]" placeholder="0">
  //         </div>
  //       </div>
  //       <div class="row">
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[3][pieces]">Pieces</label>
  //           <input type="number" class="form-control" name="overDimension[3][pieces]" placeholder="0">
  //         </div>
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[3][length]">Length (in)</label>
  //           <input type="number" class="form-control" name="overDimension[3][length]" placeholder="0">
  //         </div>
  //       </div>
  //       <div class="row">
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[4][pieces]">Pieces</label>
  //           <input type="number" class="form-control" name="overDimension[4][pieces]" placeholder="0">
  //         </div>
  //         <div class="col-md-4">
  //           <label class="form-label" for="overDimension[4][length]">Length (in)</label>
  //           <input type="number" class="form-control" name="overDimension[4][length]" placeholder="0">
  //         </div>
  //       </div>
  //     `
  //     accessorials.insertAdjacentElement('afterend', newRow)
  //   }
  //   else {
  //     if(overDimensionContainer) {
  //       overDimensionContainer.remove()
  //     }
  //   }
  // })
});
