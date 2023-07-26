import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Filter } from 'src/app/shared/model/Filter';
import { CommonService } from 'src/app/shared/service/common.service';
import { GadgetService } from '../../service/gadget.service';
import { MatSelect } from '@angular/material/select';
import { Observable, map, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { MatSelectionList } from '@angular/material/list';
import { MatAutocomplete } from '@angular/material/autocomplete';

@Component({
  selector: 'app-gadget-filter',
  templateUrl: './gadget-filter.component.html',
  styleUrls: ['./gadget-filter.component.css']
})
export class GadgetFilterComponent {

  stateControl = new FormControl("");
  cityControl = new FormControl("");
  nearByControl = new FormControl("");
  filteredStates!: Observable<{ id: number; name: string; }[]>;
  filteredCities!: Observable<{ id: number; name: string; }[]>;
  filteredNearBy!: Observable<{ id: number; name: string; }[]>;
  priceRange: number = 0;
  country: any;
  districts: any = [];
  cities: any = [];
  nearByPlaces: any = [];
  selectedBrand: string = '';
  fromPrice = 0;
  toPrice = 0;
  brands: any = [];
  subCategory: any;
  mainCategory: string = "";
  filterObj = new Filter();
  appliedFilters: any = [];
  @ViewChild('brandMultiSelect') brandMultiSelect!: MatSelect;
  @ViewChild('stateMatAutocomplete') stateAutocomplete!: MatAutocomplete;
  @ViewChild('cityMatAutocomplete') cityAutocomplete!: MatAutocomplete;
  @ViewChild('nearByMatAutocomplete') nearByAutocomplete!: MatAutocomplete;
  @ViewChild(MatSelectionList)
  matSelectionList!: MatSelectionList;
  constructor(private commonService: CommonService, private route: ActivatedRoute,
    private gadgetService: GadgetService) { }

  ngOnInit() {
    this.commonService.getCountry().subscribe((data: any) => {
      this.country = data[0];
      this.getAllStates();
    });
    this.route.queryParams.subscribe((params: any) => {
      this.subCategory = params.sub;
      this.mainCategory = params.type;
      this.filterObj.subCategoryId = Number(params.sub);
      switch (this.subCategory) {
        case "1": {
          this.getMobileBrands();
          break;
        }
        case "2": {
          this.getTabletBrands();
          break;
        }
      }
    });
  }
  getAllStates() {
    this.commonService.getStatesByCountry(this.country.id).subscribe(data => {
      this.districts = data;
      this.getFilteredStates();
    });
  }
  onDistrictChange(event: any) {
    this.filterObj.state = (event.option.value == null) ? null : event.option.value.name;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("state", this.filterObj.state);
    if (this.filterObj.state == null)
      this.appliedFilters = this.appliedFilters.filter((item: any) => (item.name != 'city' && item.name != 'nearBy'));
    else
      this.getCities(event.option.value.id);
  }
  getCities(stateId: Number) {
    this.commonService.getCitiesByState(stateId).subscribe(data => {
      this.cities = data;
      this.getFilteredCities();
    });
  }
  onCityChange(event: any) {
    this.filterObj.city = (event.option.value == null) ? null : event.option.value.name;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("city", this.filterObj.city);
    if (this.filterObj.city == null)
      this.appliedFilters = this.appliedFilters.filter((item: any) => (item.name != 'nearBy'));
    else
      this.getNearByPlaces(event.option.value.id);
  }
  onNearByChange(event: any) {
    this.filterObj.nearBy = (event.option.value == null) ? null : event.option.value.name;
    this.updateAppliedFilters("nearBy", this.filterObj.nearBy);
    this.commonService.setData(this.filterObj);
  }
  priceChange() {
    let prices = [];
    prices.push(Number(this.fromPrice));
    prices.push(Number(this.toPrice));
    this.filterObj.price = prices;
    this.commonService.setData(this.filterObj);
    this.updateAppliedFilters("price", this.formatAmount(this.fromPrice) + " - " + this.formatAmount(this.toPrice));
  }
  getMobileBrands() {
    this.gadgetService.getMobileBrands().subscribe(data => {
      this.brands = data;
    });
  }
  onBrandSelect(event: any) {
    let brandIds = [];
    this.appliedFilters = this.appliedFilters.filter((item: any) => item.name != 'brands');
    for (let value of event.value) {
      brandIds.push(value.id);
      this.updateAppliedFilters("brands", value.brandName);
    }
    this.filterObj.mobileBrandId = brandIds;
    this.commonService.setData(this.filterObj);
  }
  getTabletBrands() {
    this.gadgetService.getTabletBrands().subscribe(data => {
      this.brands = data;
    });
  }
  removeItem(item: any): void {
    if (item.name == 'state') {
      const cityIndex = this.appliedFilters.findIndex((item: any) => item.name == 'city');
      if (cityIndex >= 0) {
        this.appliedFilters.splice(cityIndex, 1);
      }
    }
    if (item.name == 'state' || item.name == 'city') {
      const nearByIndex = this.appliedFilters.findIndex((item: any) => item.name == 'nearBy');
      if (nearByIndex >= 0) {
        this.appliedFilters.splice(nearByIndex, 1);
      }
    }
    const index = this.appliedFilters.indexOf(item);
    if (index >= 0) {
      this.appliedFilters.splice(index, 1);
      this.updateFilterColumns(item);
    }
  }
  formatAmount(amount: number): string {
    return amount.toLocaleString('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  }
  updateAppliedFilters(filterName: string, value: any) {
    let matchFound = false;
    for (let i = 0; i < this.appliedFilters.length; i++) {
      if (this.appliedFilters[i].name == filterName && (filterName == 'state' || filterName == 'city' || filterName == 'nearBy' || filterName == 'price' || filterName == 'kms')) {
        matchFound = true;
        (value == null) ? this.appliedFilters.splice(i, 1) : this.appliedFilters[i].value = value;
        break;
      }
    }
    if (!matchFound)
      this.appliedFilters.push({ name: filterName, value: value })
  }
  displayLocation(brand: any): string {
    return brand?.name || "";
  }
  getFilteredStates() {
    this.filteredStates = this.stateControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.districts))
    );
  }
  filterLocations(value: any, dataArray: any[]): { id: number; name: string }[] {
    var filterValue = "";
    if (typeof value == 'object')
      filterValue = value.name.toLowerCase();
    else
      filterValue = value.toLowerCase();
    return dataArray.filter(
      (data: any) => data.name.toLowerCase().indexOf(filterValue) === 0
    );
  }
  updateFilterColumns(filter: any) {
    switch (filter.name) {
      case "brands":
        this.removeOptionFromArray(this.brandMultiSelect, (this.filterObj.vehicelBrandId || []), "brandName", filter.value);
        break;
      case "state":
        this.resetFilters();
        break;
      case "city":
        this.resetCityAndNearby();
        break;
      case "nearBy":
        this.resetNearBy();
        break;
      case "price":
        this.resetPrice();
        break;
    }
    console.log(this.filterObj);
    this.commonService.setData(this.filterObj);
  }

  removeOptionFromArray(select: any, dataArray: any[], key: string | null, value: any) {
    const selectedOptions = select.value as any[];
    const index = selectedOptions.findIndex((option: any) => {
      if (key) {
        return option[key].toLowerCase() === value.toLowerCase();
      } else {
        return option === value;
      }
    });

    const deleteIndex = dataArray?.indexOf(selectedOptions[index].id);
    if (deleteIndex !== -1 && deleteIndex !== undefined) {
      dataArray?.splice(deleteIndex, 1);
    }
    if (index !== -1) {
      selectedOptions.splice(index, 1);
      select.writeValue(selectedOptions);
    }
  }

  resetFilters() {
    this.stateControl.patchValue("");
    this.cityControl.patchValue("");
    this.nearByControl.patchValue("");
    this.stateAutocomplete.options.forEach(option => option.deselect());
    this.filterObj.state = null;
    this.filterObj.city = null;
    this.filterObj.nearBy = null;
  }

  resetCityAndNearby() {
    this.cityControl.patchValue("");
    this.nearByControl.patchValue("");
    this.cityAutocomplete.options.forEach(option => option.deselect());
    this.filterObj.city = null;
    this.filterObj.nearBy = null;
  }

  resetNearBy() {
    this.nearByControl.patchValue("");
    this.filterObj.nearBy = null;
    this.nearByAutocomplete.options.forEach(option => option.deselect());
  }

  resetPrice() {
    this.fromPrice = 0;
    this.toPrice = 0;
    this.filterObj.price = null;
  }
  getFilteredCities() {
    this.filteredCities = this.cityControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.cities))
    );
  }
  getFilteredNearBy() {
    this.filteredNearBy = this.nearByControl.valueChanges.pipe(
      startWith(""),
      map((value) => this.filterLocations(value || "", this.nearByPlaces))
    );
  }
  getNearByPlaces(cityId: Number) {
    this.commonService.getNearPlacesByCity(cityId).subscribe(data => {
      this.nearByPlaces = data;
      this.getFilteredNearBy();
    })
  }
}
