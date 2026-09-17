const fs = require('fs');
let code = fs.readFileSync('src/SurvivorGame.tsx', 'utf8');

const badBlock = `                                    )
                                })}
                            </div>
                        </div>
                    )}
                    
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}`;

code = code.replace(badBlock, `                                    )
                                })}
                            </div>
                        </div>
                    )}`);
                    
fs.writeFileSync('src/SurvivorGame.tsx', code);
