/**
 * POLC Module Data and Logic
 */

const POLC_DATA = [
    {
        "id": "root",
        "label": "Nagyatád Város Ügyfél",
        "icon": "fas fa-user",
        "color": "#0057A0",
        "children": [
            {
                "label": "Nagyatád Város Önkormányzata",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "Ady E. u. 1/a ép.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000004331",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Baross Gábor utca 1",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000029807",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Laktanya külterület hrsz.: 0220/48",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000028700",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Baross Gábor utca",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025328",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Árpád utca 1. ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025333",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Széchenyi tér 25.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024899",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Szent István park",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001599781",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Szent István park 1384/1.ép ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001612843",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kossuth L. u. 3. köztér  tra fmel",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025329",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Korányi Sándor utca 5.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000424387",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Baross Gábor utca 5/A. fszt. 5-6.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024842",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Hunyadi utca 10. fszt.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024848",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000000024840",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kiszely László utca 7.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024830",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kossuth L. u. 11. előtt ép.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001684044",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Beregszászi utca 3. ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001684018",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kossuth Lajos utca 20 előtt ép.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001684024",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Nagy Imre tér 1 hsz előtt ép.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001684021",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Koch Róbert utca 0/A. ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024844",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000000024843",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Korányi Sándor utca 2. fszt. 2.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000433752",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Korányi Sándor utca 4. fszt. 38.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024838",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Hunyadi utca 8. fszt. 1. ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025332",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Gyár u. HRSZ: 0220/85 ép.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001740079",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Baross Gábor utca 5/A. fszt. 2. ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024832",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Hunyadi utca 8. fszt. 3. ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024837",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Somogyszobi u. 0/B 15 em.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000425698",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Széchenyi tér 1693 hrsz ép.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001548788",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000001513768",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Hunyadi utca 8. fszt. 4. ",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025330",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kossuth Lajos utca 7/c. fszt.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000472661",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kossuth L. u. 16. HRSZ: 1713/A",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025331",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Nagyatád Város Önkormányzata Városgondnoksága",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "Piac tér 3/A.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025166",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Szabadság utca 17.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025167",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kiszey utca 15.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000455419",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Szabadság utca 2532 hrsz.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001684043",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Nagyatádi Intézmények Ellátó Szervezet",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "Rozsnyói utca 2/A.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000029591",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Árpád utca 16.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000029593",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Alkotmány utca 15.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000433050",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Aradi utca 1.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000421762",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Rákóczi utca 41.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000039417",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000000437736",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Honvéd utca 76.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000406621",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Nagyatádi Kulturális és Sport Központ",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "Szent István park 2.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120F11-U-SPORTKOZPONT-NAGYAT",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Nagy Imre tér 1.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120F11-U-ONKORM-NAGYATAD----",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Széchenyi tér 7.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000402322",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000000402332",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Kiszely László utca 42.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000445526",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000001536071",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Széchenyi tér 13-14.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024996",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Széchenyi tér 2.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024993",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Göröndi út",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024995",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000000024994",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Háromfai utca 14.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024998",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Rákóczi utca 41.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000024992",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Nagyatádi Polgármesteri Hivatal",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "Baross Gábor utca 9.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120F11-U-POLGM-HIV-NAGYTAD--",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Rinyamenti Kistérségi Többcélú Önkormányzati Társulás",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "Bajcsy-Zsilinszky 1/A.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000455380",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Rinyamenti Szociális és Szolgáltató Központ",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "Árpád utca 18.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000025690",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "7551 Lábod, Kossuth u. 43.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000466682",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Széchenyi tér 3/A.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000000029568",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    },
                    {
                        "label": "Rákóczi utca 43.",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "HU000120-11-S00000000000001588403",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            },
                            {
                                "label": "HU000120-11-S00000000000000029573",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Számlázás módja",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": NaN,
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "nan",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Fix ár",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": "E2 árát tudják tartani",
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "nan",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            },
            {
                "label": "Indexált ár",
                "icon": "fas fa-th-large",
                "color": "#009EDE",
                "children": [
                    {
                        "label": NaN,
                        "icon": "fas fa-home",
                        "color": "#009EDE",
                        "children": [
                            {
                                "label": "nan",
                                "type": "ELECTRIC",
                                "icon": "fas fa-bolt",
                                "color": "#f5db49"
                            }
                        ]
                    }
                ]
            }
        ]
    }
];;

// Mock Invoices
const generateInvoices = (pod, count = 20) => {
    const invoices = [];
    const types = ["RHD", "ENERGIA", "VÍZ", "CSATORNA"];
    const providers = ["E.ON Dél-Dunántúli Áramhálózati Zrt.", "MVM Next Energiakereskedelmi Zrt.", "DRV Zrt."];

    for (let i = 0; i < count; i++) {
        const date = new Date(2023, 11 - Math.floor(i / 2), 15 - (i % 15));
        const dueDate = new Date(date);
        dueDate.setDate(date.getDate() + 20);

        const periodStart = new Date(date);
        periodStart.setDate(1);
        const periodEnd = new Date(date);
        periodEnd.setMonth(date.getMonth() + 1);
        periodEnd.setDate(0);

        invoices.push({
            pod: pod,
            provider: providers[Math.floor(Math.random() * providers.length)],
            type: types[Math.floor(Math.random() * types.length)],
            serial: "130" + Math.floor(100000000 + Math.random() * 900000000),
            date: date.toISOString().split('T')[0],
            period: `${periodStart.toISOString().split('T')[0]} - ${periodEnd.toISOString().split('T')[0]}`,
            amount: Math.floor(5000 + Math.random() * 500000).toLocaleString() + " Ft",
            consumption: Math.floor(Math.random() * 1500) + " unit",
            dueDate: dueDate.toISOString().split('T')[0],
            start: periodStart.toISOString().split('T')[0],
            end: periodEnd.toISOString().split('T')[0]
        });
    }
    return invoices;
};

const PolcApp = {
    init() {
        this.renderTree();
        this.setupEventListeners();
    },

    renderTree(filter = "") {
        const container = document.getElementById('tree-view');
        container.innerHTML = '';

        const renderNode = (node, parentElement) => {
            if (filter && !this.nodeMatches(node, filter) && !this.hasMatchingChild(node, filter)) {
                return;
            }

            const nodeEl = document.createElement('div');
            nodeEl.className = 'tree-node';
            if (node.children) nodeEl.classList.add('has-children');

            const contentEl = document.createElement('div');
            contentEl.className = 'node-content';

            if (node.children) {
                const toggler = document.createElement('i');
                toggler.className = 'fas fa-caret-down toggler';
                toggler.onclick = (e) => {
                    e.stopPropagation();
                    nodeEl.classList.toggle('collapsed');
                    toggler.classList.toggle('fa-caret-right');
                    toggler.classList.toggle('fa-caret-down');
                };
                contentEl.appendChild(toggler);
            } else {
                const spacer = document.createElement('span');
                spacer.style.width = '1.25rem';
                spacer.style.display = 'inline-block';
                contentEl.appendChild(spacer);
            }

            const icon = document.createElement('i');
            icon.className = node.icon + ' node-icon';
            icon.style.color = node.color;
            contentEl.appendChild(icon);

            const label = document.createElement('span');
            label.className = 'node-label';
            label.textContent = node.label;
            contentEl.appendChild(label);

            contentEl.onclick = () => {
                document.querySelectorAll('.node-content').forEach(el => el.classList.remove('selected'));
                contentEl.classList.add('selected');
                if (!node.children) {
                    this.showInvoices(node.label);
                }
            };

            nodeEl.appendChild(contentEl);

            if (node.children) {
                const childrenContainer = document.createElement('div');
                childrenContainer.className = 'node-children';
                node.children.forEach(child => renderNode(child, childrenContainer));
                nodeEl.appendChild(childrenContainer);
            }

            parentElement.appendChild(nodeEl);
        };

        POLC_DATA.forEach(node => renderNode(node, container));
    },

    nodeMatches(node, filter) {
        const query = filter.toLowerCase();
        const label = (node.label || "").toString().toLowerCase();
        const type = (node.type || "").toString().toLowerCase();
        const id = (node.id || "").toString().toLowerCase();

        // Search in label, type, and id
        if (label.includes(query) || type.includes(query) || id.includes(query)) return true;

        // Search in children labels recursively (already handled by hasMatchingChild but good to keep clean)
        return false;
    },

    hasMatchingChild(node, filter) {
        if (!node.children) return false;
        return node.children.some(child => this.nodeMatches(child, filter) || this.hasMatchingChild(child, filter));
    },

    setupEventListeners() {
        document.getElementById('tree-search').oninput = (e) => {
            this.renderTree(e.target.value);
        };
    },

    showInvoices(pod) {
        const container = document.getElementById('invoice-list');
        const count = 20 + Math.floor(Math.random() * 30);
        const data = generateInvoices(pod, count);

        document.getElementById('selected-pod-title').textContent = pod;

        let html = `
            <table class="premium-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Szolgáltató</th>
                        <th>Típus</th>
                        <th>Sorszám</th>
                        <th>Kelt</th>
                        <th>Fizetendő</th>
                        <th>Határidő</th>
                        <th>Műveletek</th>
                    </tr>
                </thead>
                <tbody>
        `;

        data.forEach((inv, index) => {
            html += `
                <tr>
                    <td>${index + 1}.</td>
                    <td>${inv.provider}</td>
                    <td><span class="badge badge-${inv.type.toLowerCase()}">${inv.type}</span></td>
                    <td>${inv.serial}</td>
                    <td>${inv.date}</td>
                    <td class="amount">${inv.amount}</td>
                    <td>${inv.dueDate}</td>
                    <td>
                        <button class="btn-icon" style="background: black !important; color: white !important; border: 1px solid #333;" title="Megtekintés"><i class="fas fa-eye"></i></button>
                        <button class="btn-icon" style="background: black !important; color: white !important; border: 1px solid #333;" title="Letöltés"><i class="fas fa-download"></i></button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
        container.classList.add('fade-in');
        setTimeout(() => container.classList.remove('fade-in'), 500);
    },

    exportPDF() {
        const pod = document.getElementById('selected-pod-title').textContent;
        if (pod === 'Válasszon egy fogyasztási helyet') {
            alert('Kérjük válasszon egy fogyasztási helyet az exportáláshoz!');
            return;
        }

        const element = document.getElementById('invoice-list');
        const opt = {
            margin: 10,
            filename: `POLC_Export_${pod}_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };

        // Add a temporary title and styles for the PDF
        const title = document.createElement('h3');
        title.textContent = `Számlalista: ${pod}`;
        title.style.marginBottom = '20px';
        title.style.textAlign = 'center';
        title.style.color = '#000000';

        // Create a style element to force black text
        const style = document.createElement('style');
        style.textContent = `
            #invoice-list, #invoice-list * { 
                color: #000000 !important; 
                background-color: #ffffff !important; 
            }
            .invoice-header { background-color: #f0f0f0 !important; }
        `;

        element.prepend(style);
        element.prepend(title);

        html2pdf().from(element).set(opt).save().then(() => {
            element.removeChild(title);
            element.removeChild(style);
        });
    }
};

window.onload = () => PolcApp.init();
